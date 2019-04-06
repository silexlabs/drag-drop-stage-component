import Event from 'emitter-js';
import * as Polyfill from './utils/Polyfill';
import {Mouse} from './Mouse';
import {MouseEventsListener} from './MouseEventsListener';
import {StoreEventsListener} from './StoreEventsListener';
import * as Store from './store';
import * as DomMetrics from './utils/DomMetrics';
import * as SelectionAction from './store/Selection';
import * as UiAction from './store/Ui';

/**
 * This class is the entry point of the library
 * @see https://github.com/lexoyo/stage
 * @class Stage
 */
class Stage extends Event  {
  /**
   * Init the useful classes,
   * add styles to the iframe for the UI,
   * listen to mouse events in the iframe and outside
   * @constructor
   */
  constructor(iframe, options={}) {
    super();

    // store the params
    this.iframe = iframe;
    this.contentWindow = this.iframe.contentWindow;
    this.contentDocument = this.iframe.contentDocument;
    const hooks = {
      isSelectableHook: options.isSelectableHook || (el => el.classList.contains('selectable')),
      isDraggableHook: options.isDraggableHook || (el => el.classList.contains('draggable')),
      isDroppableHook: options.isDroppableHook || ((el, selection) => el.classList.contains('droppable')),
      isResizeableHook: options.isResizeableHook || ((el, selection) => el.classList.contains('resizeable')),
    }

    // polyfill the iframe
    Polyfill.patchWindow(this.contentWindow);

    // load styles for the UI in the iframe
    var link = this.contentDocument.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', /*FIXME: Url.makeAbsolute*/('css/stage.css'));
    this.contentDocument.head.appendChild(link);

    // register store events
    this.store = Store.createStore(this.contentDocument, hooks);
    const storeEventsListener = new StoreEventsListener(this.contentDocument, this.store);

    // register mouse events
    const mouse = new Mouse(this.contentWindow);
    const mouseEventsListener = new MouseEventsListener(this.contentDocument, mouse, this.store);

    // relay the store events to the calling app
    this.store.subscribe(() => this.emit('change', this.store.getState()))
    // keyboard shortcuts
    window.addEventListener("keydown", (e) => this.onKeyDown(e.keyCode));
    this.contentWindow.addEventListener("keydown", (e) => this.onKeyDown(e.keyCode));
  }


  /**
   * handle shortcuts
   */
  onKeyDown(key) {
    switch(key) {
      case 27:
        if(this.state != State.NONE) {
          // cancel any pending operation
          this.cancel();
        }
        else {
          // or reset selection
          this.store.dispatch(SelectionAction.reset());
        }
        break;
      default:
    }
  }


  /**
   * Stop drag
   * @private
   */
  cancel() {
    this.store.dispatch(SelectionAction.reset());
    this.store.dispatch(UiAction.setModeNone());
  }
}

exports.Stage = Stage;
if(window) window.Stage = Stage;
