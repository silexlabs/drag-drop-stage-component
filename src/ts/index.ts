import * as types from './Types';
import * as Polyfill from './utils/Polyfill';
import * as DomMetrics from './utils/DomMetrics';
import {Keyboard} from './Keyboard';
import {Mouse} from './Mouse';
import * as selectionState from './flux/SelectionState';
import * as UiAction from './flux/UiState';
import {SelectablesObserver} from './observers/SelectablesObserver';
import {MouseObserver} from './observers/MouseObserver';
import {UiObserver} from './observers/UiObserver';
import {StageStore} from './flux/StageStore';
import { resetSelectables, createSelectable, updateSelectables, deleteSelectable } from './flux/SelectableState';
import { addEvent } from './utils/Events';
import { setScroll } from './flux/MouseState';
import { Ui } from './Ui';

/**
 * This class is the entry point of the library
 * @see https://github.com/lexoyo/stage
 * @class Stage
 */
export class Stage {
  protected contentWindow: Window;
  protected contentDocument: HTMLDocument;
  protected iframe: HTMLIFrameElement;
  protected hooks: types.Hooks;
  protected unsubscribeAll: Array<() => void> = [];
  protected ui: Ui;
  protected store: StageStore;

  /**
   * Init the useful classes,
   * add styles to the iframe for the UI,
   * listen to mouse events in the iframe and outside
   * @constructor
   */
  constructor(iframe: HTMLIFrameElement, elements: ArrayLike<HTMLElement>, options: types.Hooks={}) {
    // expose for client app
    window['Stage'] = Stage;

    // store the params
    this.iframe = iframe;
    this.contentWindow = this.iframe.contentWindow;
    this.contentDocument = this.iframe.contentDocument;
    this.hooks = {
      ...options, // other hooks without default values
      isSelectable: options.isSelectable || (el => el.classList.contains('selectable')),
      isDraggable: options.isDraggable || (el => el.classList.contains('draggable')),
      isDropZone: options.isDropZone || ((el) => el.classList.contains('droppable')),
      isResizeable: options.isResizeable || ((el) => el.classList.contains('resizeable')),
      useMinHeight: options.useMinHeight || ((el) => true),
      canDrop: options.canDrop || ((el, dropZone) => true),
    }

    // polyfill the iframe
    Polyfill.patchWindow(this.contentWindow);

    // create the store and populate it
    this.store = new StageStore();
    Array.from(elements).forEach(el => this.addElement(el))

    // add a UI over the iframe
    this.ui = new Ui(iframe, this.store);

    // state observers
    const selectablesObserver = new SelectablesObserver(this.contentDocument, this.ui.overlay.contentDocument, this.store, this.hooks);
    const uiObserver = new UiObserver(this.contentDocument, this.ui.overlay.contentDocument, this.store, this.hooks);
    const mouseObserver = new MouseObserver(this.contentDocument, this.ui.overlay.contentDocument, this.store, this.hooks);

    // controllers
    const mouse = new Mouse(this.contentWindow, this.ui.overlay.contentWindow, this.store, this.hooks);
    const keyboard = new Keyboard(this.ui.overlay.contentWindow, this.store, this.hooks);

    this.unsubscribeAll.push(
      () => selectablesObserver.cleanup(),
      () => uiObserver.cleanup(),
      () => mouseObserver.cleanup(),
      () => mouse.cleanup(),
      () => keyboard.cleanup(),

      // window resize
      addEvent(window, 'resize', (e: MouseEvent) => this.redraw()),
    );
  }


  /**
   * to be called before deleting the stage
   */
  cleanup() {
    this.unsubscribeAll.forEach(u => u());
    this.ui.cleanup();
    this.ui = null;
  }

  /**
   * enable/disable catching events
   */
  get catchingEvents(): boolean {
    return this.store.getState().ui.catchingEvents;
  }
  set catchingEvents(val: boolean) {
    this.store.dispatch(UiAction.setCatchingEvents(val));
  }
  /**
   * enable/disable catching events
   */
  get visible(): boolean {
    return this.store.getState().ui.mode !== types.UiMode.HIDE;
  }
  set visible(val: boolean) {
    // dispatch UI mode change
    this.store.dispatch(UiAction.setMode(val ? types.UiMode.NONE : types.UiMode.HIDE));
    // scroll may have changed
    this.setScroll({
      x: this.iframe.contentWindow.scrollX,
      y: this.iframe.contentWindow.scrollY,
    });
  }
  /**
   * force resize of UI
   */
  resizeWindow() {
    this.ui.resizeOverlay();
  }

  ///////////////////////////////////////////////////
  // Elements and metrics
  ///////////////////////////////////////////////////

  /**
   * recalculate all the metrics
   */
  redraw() {
    this.store.dispatch(UiAction.setRefreshing(true));
    this.store.dispatch(updateSelectables(this.store.getState().selectables.map(selectable => {
      return {
        ...selectable,
        metrics: DomMetrics.getMetrics(selectable.el),
      }
    })));
    this.store.dispatch(UiAction.setRefreshing(false));
  }

  /**
   * get/set the states of the selected elements
   */
  getSelection(): Array<types.SelectableState> {
    return DomMetrics.getSelection(this.store);
  }

  /**
   * get/set the states of the selected elements
   */
  setSelection(elements: Array<HTMLElement>) {
    this.store.dispatch(selectionState.set(elements.map(el => this.getState(el))));
  }

  /**
   * get/set the state for an element
   */
  getState(el: HTMLElement): types.SelectableState {
    return DomMetrics.getSelectable(this.store, el);
  }

  /**
   * get/set the state for an element
   */
  setState(el: HTMLElement, subState: {
    selected?: boolean,
    selectable?: boolean,
    draggable?: boolean,
    resizeable?: types.Direction,
    isDropZone?: boolean,
    useMinHeight?: boolean,
    metrics?: types.ElementMetrics,
  }) {
    const state = this.getState(el);
    this.store.dispatch(updateSelectables([{
      ...state,
      ...subState,
    }]));
  }

  /**
   * Add an element to the store
   */
  addElement(el: HTMLElement) {
    const boolOrObj: types.Direction | boolean = this.hooks.isResizeable(el);
    const resizeable = typeof boolOrObj === 'object' ? boolOrObj : {
      top: boolOrObj as boolean,
      left: boolOrObj as boolean,
      bottom: boolOrObj as boolean,
      right: boolOrObj as boolean,
    }
    // do not apply style change to this element
    this.store.dispatch(UiAction.setRefreshing(true));

    // create an element in the store
    this.store.dispatch(createSelectable({
      el,
      selected: false,
      selectable: this.hooks.isSelectable(el),
      draggable: this.hooks.isDraggable(el),
      resizeable,
      isDropZone: this.hooks.isDropZone(el),
      useMinHeight: this.hooks.useMinHeight(el),
      metrics: DomMetrics.getMetrics(el),
    }));
    // compute all metrics again because this element might affect others
    this.redraw();
  }

  /**
   * Remove an element from the store
   */
  removeElement(el: HTMLElement) {
    this.store.dispatch(deleteSelectable(this.store.getState().selectables.find(s => s.el === el)));
    // compute all metrics again because this element might affect others
    this.redraw();
  }


  /**
   * get the best drop zone at a given position
   * if the `el` param is provided, filter possible drop zones with the `canDrop` hook
   */
  getDropZone(x: number, y: number, el:HTMLElement = null): HTMLElement {
    const dropZones = DomMetrics.findDropZonesUnderMouse(this.contentDocument, this.store, this.hooks, x, y);
    if(!!el) return dropZones.filter(dropZone => this.hooks.canDrop(el, dropZone))[0];
    else return dropZones[0];
  }

  ///////////////////////////////////////////////////
  // Scroll
  ///////////////////////////////////////////////////

  /**
   * scroll so that the elements are visible
   */
  show(elements: Array<HTMLElement>) {
    const state = this.store.getState();
    const bb = DomMetrics.getBoundingBox(elements.map(el => state.selectables.find(s => s.el === el)));
    const initialScroll: types.ScrollData = state.mouse.scrollData;
    const scroll: types.ScrollData = DomMetrics.getScrollToShow(this.contentDocument, bb);
    if(scroll.x !== initialScroll.x || scroll.y !== initialScroll.y) {
      this.store.dispatch(setScroll(scroll));
    }
  }


  /**
   * scroll so that the elements are centered
   */
  center(elements: Array<HTMLElement>) {
    const state = this.store.getState();
    const bb = DomMetrics.getBoundingBox(
      elements
      .map(el => state.selectables.find(s => s.el === el))
      .filter(s => !!s)
    );
    const initialScroll: types.ScrollData = state.mouse.scrollData;
    const scroll: types.ScrollData = {
      x: Math.max(0, Math.round(bb.left + (bb.width/2))),
      y: Math.max(0, Math.round(bb.top + (bb.height/2))),
    };
    if(scroll.x !== initialScroll.x || scroll.y !== initialScroll.y) {
      this.store.dispatch(setScroll(scroll));
    }
  }


  /**
   * get/set the stage scroll data
   */
  setScroll(scroll: types.ScrollData) {
    const initialScroll: types.ScrollData = this.store.getState().mouse.scrollData;
    if(scroll.x !== initialScroll.x || scroll.y !== initialScroll.y) {
      this.store.dispatch(setScroll(scroll));
    }
  }


  /**
   * get/set the stage scroll data
   */
  getScroll(): types.ScrollData {
    return this.store.getState().mouse.scrollData;
  }
}
