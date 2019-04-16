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
  store: StageStore;

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
      canDrop: options.canDrop || ((el, selection) => true),
    }

    // polyfill the iframe
    Polyfill.patchWindow(this.contentWindow);

    // load styles for the UI in the iframe
    var link = this.contentDocument.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', /*FIXME: Url.makeAbsolute*/('css/stage.css'));
    this.contentDocument.head.appendChild(link);

    // create the store and populate it
    this.store = new StageStore();
    Array.from(elements).forEach(el => this.addElement(el))


    // state observers
    const selectablesObserver = new SelectablesObserver(this.contentDocument, this.store, this.hooks);
    const uiObserver = new UiObserver(this.contentDocument, this.store, this.hooks);
    const mouseObserver = new MouseObserver(this.contentDocument, this.store, this.hooks);

    // controllers
    const mouse = new Mouse(this.contentWindow, this.store);
    const keyboard = new Keyboard(this.contentWindow, this.store);

    this.unsubscribeAll.push(

      () => selectablesObserver.cleanup(),
      () => uiObserver.cleanup(),
      () => mouseObserver.cleanup(),
      () => mouse.cleanup(),
      () => keyboard.cleanup(),

      // window resize
      addEvent(window, "resize", (e: MouseEvent) => this.redraw()),
    );
  }

  cleanup() {
    this.unsubscribeAll.forEach(u => u());
  }

  /**
   * recalculate all the metrics
   */
  redraw() {
    this.store.dispatch(updateSelectables(this.store.getState().selectables));
  }

  /**
   * Add an element to the store
   */
  addElement(el: HTMLElement) {
    this.store.dispatch(createSelectable({
      el,
      selected: false,
      selectable: this.hooks.isSelectable(el),
      draggable: this.hooks.isDraggable(el),
      resizeable: this.hooks.isResizeable(el),
      isDropZone: this.hooks.isDropZone(el),
      useMinHeight: this.hooks.useMinHeight(el),
      metrics: DomMetrics.getMetrics(el),
    }));
    console.info('todo: scroll to show the element if it is not visible');
  }

  /**
   * Remove an element from the store
   */
  removeElement(el: HTMLElement) {
    this.store.dispatch(deleteSelectable(this.store.getState().selectables.find(s => s.el === el)));
  }
}
