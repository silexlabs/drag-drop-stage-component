import * as types from './Types';
import * as Polyfill from './utils/Polyfill';
import * as DomMetrics from './utils/DomMetrics';
import {Keyboard} from './Keyboard';
import {Mouse, MouseMode} from './Mouse';
import * as selectionState from './flux/SelectionState';
import * as UiAction from './flux/UiState';
import * as SelectableAction from './flux/SelectableState';
import {SelectablesObserver} from './observers/SelectablesObserver';
import {MouseObserver} from './observers/MouseObserver';
import {UiObserver} from './observers/UiObserver';
import {StageStore} from './flux/StageStore';
import { resetSelectables, createSelectable, updateSelectables, deleteSelectable } from './flux/SelectableState';
import { addEvent } from './utils/Events';
import { setScroll } from './flux/MouseState';
import { Ui } from './Ui';
import { MoveHandler } from './handlers/MoveHandler';

/**
 * This class is the entry point of the library
 * @see https://github.com/silexlabs/drag-drop-stage-component
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
  protected mouse: Mouse;

  protected selectablesObserver: SelectablesObserver;
  protected uiObserver: UiObserver;
  protected mouseObserver: MouseObserver;

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
      getId: options.getId || (el => {
        if(el.hasAttribute('data-stage-id')) return el.getAttribute('data-stage-id');
        const id = Math.round(Math.random() * 999999).toString();
        el.setAttribute('data-stage-id', id);
        return id;
      }),
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
    this.reset(elements);

    // add a UI over the iframe
    Ui.createUi(iframe, this.store)
    .then((ui: Ui) => {
      this.ui = ui;

      // state observers
      this.selectablesObserver = new SelectablesObserver(this.contentDocument, this.ui.overlay.contentDocument, this.store, this.hooks);
      this.uiObserver = new UiObserver(this.contentDocument, this.ui.overlay.contentDocument, this.store, this.hooks);
      this.mouseObserver = new MouseObserver(this.contentDocument, this.ui.overlay.contentDocument, this.store, this.hooks);

      // controllers
      this.mouse = new Mouse(this.contentWindow, this.ui.overlay.contentWindow, this.store, this.hooks);
      const keyboard = new Keyboard(this.ui.overlay.contentWindow, this.store, this.hooks);

      this.unsubscribeAll.push(
        () => this.selectablesObserver.cleanup(),
        () => this.uiObserver.cleanup(),
        () => this.mouseObserver.cleanup(),
        () => this.mouse.cleanup(),
        () => keyboard.cleanup(),

        // window resize
        addEvent(window, 'resize', (e: MouseEvent) => this.redraw()),
      );

      // finish init
      this.waitingListeners.forEach(l => l());
      this.waitingListeners = [];
    })
  }

  /**
   * start dragin the selection without a mouse click
   */
  startDrag() {
    // const bb = DomMetrics.getBoundingBoxDocument(target.el)
    const selection = this.getSelection()
    const bb = DomMetrics.getBoundingBox(selection)
    this.mouse.mouseMode = MouseMode.DRAGGING;
    this.store.dispatch(UiAction.setMode(types.UiMode.DRAG));
    // as if the mouse was initially in the middle of the first selected element
    (this.uiObserver.handler as MoveHandler).initialMouse = {
      x: bb.left + (bb.width / 2) - this.iframe.contentWindow.scrollX,
      y: bb.top + (bb.height / 2) - this.iframe.contentWindow.scrollY,
    }
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
   * enable/disable sticky
   */
  get enableSticky(): boolean {
    return this.store.getState().ui.enableSticky;
  }
  set enableSticky(val: boolean) {
    // dispatch UI mode change
    this.store.dispatch(UiAction.setEnableSticky(val));
  }
  /**
   * force resize of UI
   */
  resizeWindow() {
    this.ui.resizeOverlay();
  }

  waitingListeners: Array<() => void> = [];
  /**
   * safe subscribe to mouse event
   * handle the multiple iframes and the current window
   * @return function to call to unsubscribe
   */
  subscribeMouseEvent(type: string, cbk: (e) => void): () => void {
    let unsub;
    if(!this.mouse) {
      this.waitingListeners.push(() => {
        unsub = this.subscribeMouseEvent(type, cbk)
      });
      return () => unsub();
    }
    return this.mouse.subscribeMouseEvent(type, cbk);
  }


  /**
   * hide all iframes scroll (useful when you don't want to miss mouse events)
   */
  hideScrolls(hide: boolean) {
    this.ui.hideScrolls(hide);
  }

  ///////////////////////////////////////////////////
  // Elements and metrics
  ///////////////////////////////////////////////////

  /**
   * recalculate all the metrics
   */
  redraw() {
    this.redrawSome(this.store.getState().selectables);
  }
  redrawSome(selectables: Array<types.SelectableState>) {
    if (!this.store.getState().ui.refreshing) {
      this.store.dispatch(UiAction.setRefreshing(true));
      this.store.dispatch(updateSelectables(selectables.map(selectable => {
        return {
          ...selectable,
          metrics: DomMetrics.getMetrics(selectable.el),
        }
      })));
      this.store.dispatch(UiAction.setRefreshing(false));
    }
  }

  reset(elements: ArrayLike<HTMLElement>) {
    this.store.dispatch(UiAction.setRefreshing(true));
    this.store.dispatch(resetSelectables());
    Array.from(elements).forEach(el => this.addElement(el, false));
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
    return DomMetrics.getSelectableState(this.store, el);
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
  addElement(el: HTMLElement, preventDispatch = true) {
    if(preventDispatch) {
      // do not apply style change to this element
      this.store.dispatch(UiAction.setRefreshing(true));
    }

    // create an element in the store
    this.store.dispatch(createSelectable({
      id: this.hooks.getId(el),
      el,
      selected: false,
      selectable: this.hooks.isSelectable(el),
      draggable: this.hooks.isDraggable(el),
      resizeable: this.getElementResizeable(el),
      isDropZone: this.hooks.isDropZone(el),
      useMinHeight: this.hooks.useMinHeight(el),
      metrics: DomMetrics.getMetrics(el),
    }));

    if(preventDispatch) {
      this.store.dispatch(UiAction.setRefreshing(false));
    }
    else {
      // compute all metrics again because this element might affect others
      this.redraw();
    }
  }

  protected getElementResizeable(el: HTMLElement): types.Direction {
    const boolOrObj: types.Direction | boolean = this.hooks.isResizeable(el);
    return typeof boolOrObj === 'object' ? boolOrObj : {
      top: boolOrObj as boolean,
      left: boolOrObj as boolean,
      bottom: boolOrObj as boolean,
      right: boolOrObj as boolean,
    }
  }

  /**
   * Remove an element from the store
   */
  removeElement(id: string) {
    this.store.dispatch(deleteSelectable(this.store.getState().selectables.find(s => s.id === id)));
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

  getBoundingBox(elements: Array<HTMLElement>) {
    const state = this.store.getState();
    return DomMetrics.getBoundingBox(elements.map(el => state.selectables.find(s => s.id === this.hooks.getId(el))));
  }

  getSelectionBox() {
    return DomMetrics.getBoundingBox(DomMetrics.getSelection(this.store));
  }

  ///////////////////////////////////////////////////
  // Scroll
  ///////////////////////////////////////////////////

  /**
   * scroll so that the elements are visible
   */
  show(elements: Array<HTMLElement>) {
    const state = this.store.getState();
    const bb = DomMetrics.getBoundingBox(elements.map(el => state.selectables.find(s => s.id === this.hooks.getId(el))));
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
      .map(el => state.selectables.find(s => s.id === this.hooks.getId(el)))
      .filter(s => !!s)
    );
    const initialScroll: types.ScrollData = state.mouse.scrollData;
    const scrollSize = {
      x: this.contentWindow.innerWidth,
      y: this.contentWindow.innerHeight,
    };
    const scroll: types.ScrollData = {
      x: Math.max(0, Math.round(bb.left + (bb.width/2) - (scrollSize.x / 2))),
      y: Math.max(0, Math.round(bb.top + (bb.height/2) - (scrollSize.y / 2))),
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
