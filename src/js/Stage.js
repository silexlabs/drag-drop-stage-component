import {Polyfill} from "./Polyfill";
import {Selection, Selectable} from "./Selection";
import {MouseController} from "./MouseController";
import {MoveHandler} from "./MoveHandler";
import {DrawHandler} from "./DrawHandler";
import Event from "emitter-js";

let State = {
  NONE: 'NONE',
  DRAGGING: 'DRAGGING'
}

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
  constructor(iframe) {
    super();
    // store the iframe and use its document and window
    this.iframe = iframe;
    // polyfill the iframe
    Polyfill.patchWindow(this.getWindow());
    // create useful classes
    this.selection = new Selection();
    this.handler = null;
    this.state = State.NONE;
    // load styles for the UI in the iframe
    var doc = this.getDocument();
    var link = doc.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', /*FIXME: Url.makeAbsolute*/('css/stage.css'));
    doc.head.appendChild(link);
    // register mouse events
    let mouseController = new MouseController(this.getWindow());
    mouseController.on('toggleSelect', (e) => this.toggleSelect(e.target, e.shiftKey));
    mouseController.on('drag', (e) => this.drag(e.movementX, e.movementY, e.clientX, e.clientY));
    mouseController.on('startDrag', (e) => this.startDrag(e.clientX, e.clientY, e.target));
    mouseController.on('stopDrag', (e) => this.stopDrag());
    // keyboard shortcuts
    window.addEventListener("keydown", (e) => this.keyDown(e.keyCode));
    this.getWindow().addEventListener("keydown", (e) => this.keyDown(e.keyCode));
  }


  /**
   * @return the iframe passed to the constructor
   */
  getIFrame() {
    return this.iframe;
  }


  /**
   * @return the document of the iframe passed to the constructor
   */
  getDocument() {
    return this.iframe.contentDocument;
  }


  /**
   * @return the window of the iframe passed to the constructor
   */
  getWindow() {
    return this.iframe.contentWindow;
  }


  /**
   * handle shortcuts
   */
  keyDown(key) {
    switch(key) {
      case 27:
        if(this.state != State.NONE) {
          // cancel any pending operation
          this.cancel();
        }
        else {
          // or reset selection
          this.selection.reset();
        }
        break;
      default:
    }
  }


  /**
   * @param  {Element}
   * @param  {Boolean}
   */
  toggleSelect(target, shiftKey) {
    let selectable = this.selection.getSelectable(target);
    if(selectable) {
      if(shiftKey)
        // add or remove
        this.selection.toggle(selectable, shiftKey);
      else
        // select this one and only this one
        this.selection.set([selectable]);
    }
    else if(!shiftKey) {
      console.info('element is not selectable');
      this.selection.reset();
    }
  }


  /**
   * @param  {Number}
   * @param  {Number}
   * @param  {Number}
   * @param  {Number}
   */
  drag(movementX, movementY, clientX, clientY) {
    if(this.handler)
        this.handler.update(movementX, movementY, clientX, clientY);
  }


  /**
   * @param  {Element}
   * @private
   */
  startDrag(clientX, clientY, target) {
    let selectable = this.selection.getSelectable(target);
    if(selectable && this.selection.isSelected(selectable)) {
      this.handler = new MoveHandler(this.selection.selected, this.getDocument());
    }
    else {
      this.selection.set([]);
      this.handler = new DrawHandler(clientX, clientY, this.getDocument());
      this.handler.on('toggleSelect', e => this.toggleSelect(e.target, true));
    }
  }


  /**
   * Stop dragging
   * @private
   */
  stopDrag() {
    if(this.handler) {
      this.handler.release();
      this.emit('drop', this.handler.elementsData);
    }
    this.handler = null;
  }


  /**
   * Stop dragging
   * @private
   */
  cancel() {
    if(this.handler) {
      this.handler.release();
      this.emit('cancel', this.handler.elementsData);
    }
    this.handler = null;
  }
}

exports.Stage = Stage;
if(window) window.Stage = Stage;
