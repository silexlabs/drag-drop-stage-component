import * as types from './Types';
import * as Polyfill from './utils/Polyfill';
import {Mouse} from './Mouse';
import * as selectionState from './flux/SelectionState';
import * as UiAction from './flux/UiState';
import {SelectablesObserver} from './observers/SelectablesObserver';
import {MouseObserver} from './observers/MouseObserver';
import {UiObserver} from './observers/UiObserver';
import {StageStore} from './flux/StageStore';

/**
 * This class is the entry point of the library
 * @see https://github.com/lexoyo/stage
 * @class Stage
 */
export class Stage {
  contentWindow: Window;
  contentDocument: HTMLDocument;
  iframe: HTMLIFrameElement;
  store: StageStore;

  /**
   * Init the useful classes,
   * add styles to the iframe for the UI,
   * listen to mouse events in the iframe and outside
   * @constructor
   */
  constructor(iframe, options: types.Hooks={}) {
    // expose for client app
    window['Stage'] = Stage;

    // store the params
    this.iframe = iframe;
    this.contentWindow = this.iframe.contentWindow;
    this.contentDocument = this.iframe.contentDocument;
    const hooks = {
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
    StageStore.selectablesFromDom(this.contentDocument, hooks)
    .forEach(selectable => {
      this.store.dispatch({
        type: 'SELECTABLE_CREATE',
        selectable,
      })
    })
    setTimeout(() => {
      // state observers
      new SelectablesObserver(this.contentDocument, this.store, hooks);
      new UiObserver(this.contentDocument, this.store, hooks);
      new MouseObserver(this.contentDocument, this.store, hooks);

      // controllers
      new Mouse(this.contentWindow, this.store);

      // keyboard shortcuts
      window.addEventListener("keydown", (e) => this.onKeyDown(e.keyCode));
      this.contentWindow.addEventListener("keydown", (e) => this.onKeyDown(e.keyCode));
    });
  }


  /**
   * handle shortcuts
   */
  onKeyDown(key) {
    switch(key) {
      case 27:
        this.store.dispatch(UiAction.setMode(types.UiMode.NONE));
        this.store.dispatch(selectionState.reset());
        break;
      default:
    }
  }
}
