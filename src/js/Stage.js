import {Polyfill} from "./Polyfill";
import {Selection} from "./Selection";
import {MouseController} from "./MouseController";
import {MoveHandler} from "./MoveHandler";
import {DrawHandler} from "./DrawHandler";
import Event from "emitter-js";
import { ResizeHandler } from "./ResizeHandler";

const State = {
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
  constructor(iframe, options={}) {
    super();
    // store the iframe and use its document and window
    this.iframe = iframe;
    this.isSelectableHook = options.isSelectableHook || (el => el.classList.contains('selectable'));
    this.isDraggableHook = options.isDraggableHook || (el => el.classList.contains('draggable'));
    this.isDroppableHook = options.isDroppableHook || ((el, selection) => el.classList.contains('droppable'));
    this.isResizeableHook = options.isResizeableHook || ((el, selection) => el.classList.contains('resizeable'));
    // polyfill the iframe
    Polyfill.patchWindow(this.getWindow());
    // create useful classes
    this.selection = new Selection(this.isSelectableHook);
    this.handler = null;
    this.state = State.NONE;
    // load styles for the UI in the iframe
    var doc = this.getDocument();
    var link = doc.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', /*FIXME: Url.makeAbsolute*/('css/stage.css'));
    doc.head.appendChild(link);
    // register mouse events
    const mouseController = new MouseController(this.getWindow());
    mouseController.on('down', (e) => this.onDown(e.target, e.shiftKey));
    mouseController.on('up', (e) => this.onUp(e.target, e.shiftKey));
    mouseController.on('move', (e) => this.onMove(e.clientX, e.clientY, e.target));
    mouseController.on('drag', (e) => this.drag(e.movementX, e.movementY, e.clientX, e.clientY, e.shiftKey));
    mouseController.on('startDrag', (e) => this.startDrag(e.clientX, e.clientY, e.target));
    mouseController.on('stopDrag', (e) => this.stopDrag());
    // relay the selection events
    this.selection.on('change', (selection) => this.emit('selection', selection));
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
  select(target, shiftKey) {
    const selectable = this.selection.getSelectable(target);
    if(selectable) {
      this.selection.add(selectable);
    }
  }


  /**
   * @param  {Element}
   * @param  {Boolean}
   */
  unSelect(target, shiftKey) {
    const selectable = this.selection.getSelectable(target);
    if(selectable) {
      this.selection.remove(selectable);
    }
  }


  /**
   * @param  {Element}
   * @param  {Boolean}
   */
  onDown(target, shiftKey) {
    const selectable = this.selection.getSelectable(target);
    if(selectable) {
      this.wasMultiSelected = this.selection.get().length > 1 && this.selection.isSelected(selectable);
      if(this.wasMultiSelected || shiftKey) {
        this.selection.add(selectable);
      }
      else {
        this.selection.set([selectable]);
      }
    }
    else {
      this.wasMultiSelected = false;
    }
  }


  /**
   * @param  {Element}
   * @param  {Boolean}
   */
  onMove(clientX, clientY, target) {
    const selectable = this.selection.getSelectable(target);
    if(selectable && this.isResizeableHook(selectable)) {
      const direction = ResizeHandler.getDirection(clientX, clientY, selectable);
      selectable.setAttribute('resize-x', direction.x);
      selectable.setAttribute('resize-y', direction.y);
    }
    else {
      Array.from(this.getDocument().body.querySelectorAll('[resize-x], [resize-y]'))
      .forEach(el => {
        el.removeAttribute('resize-x');
        el.removeAttribute('resize-y');
      });
    }
  }


  /**
   * @param  {Element}
   * @param  {Boolean}
   */
  onUp(target, shiftKey) {
    const selectable = this.selection.getSelectable(target);
    if(selectable) {
      if(shiftKey) {
        if(this.wasMultiSelected) {
          this.selection.remove(selectable);
        }
      }
      else {
        this.selection.set([selectable]);
      }
    }
    else if(!shiftKey) {
      this.selection.reset();
    }
    this.wasMultiSelected = false;
  }


  /**
   * @param  {Number}
   * @param  {Number}
   * @param  {Number}
   * @param  {Number}
   */
  drag(movementX, movementY, clientX, clientY, shiftKey) {
    if(this.handler)
        this.handler.update(movementX, movementY, clientX, clientY, shiftKey);
  }


  hasASelectedDraggableParent(selectable) {
    const selectableParent = this.selection.getSelectable(selectable.parentElement);
    if(selectableParent) {
      if(this.selection.isSelected(selectableParent) && this.isDraggableHook(selectableParent)) return true;
      else return this.hasASelectedDraggableParent(selectableParent);
    }
    else {
      return false;
    }
  }


  /**
   * @param  {Element}
   * @private
   */
  startDrag(clientX, clientY, target) {
    const selectable = this.selection.getSelectable(target);
    if(selectable) {
      const direction = {
        x: selectable.getAttribute('resize-x') || '',
        y: selectable.getAttribute('resize-y') || '',
      };
      // start resize
      if(this.isResizeableHook(selectable) && (direction.x != '' || direction.y != '')) {
        this.handler = new ResizeHandler(this.selection.get()
          .filter(el => this.isResizeableHook(el)),
          this.getDocument(),
          {
            useMinHeightHook: el => true,
            direction,
          });
      }
      // start drag
      else if(this.isDraggableHook(selectable)) {
        this.handler = new MoveHandler(this.selection.get()
          .filter(el => !this.hasASelectedDraggableParent(el) && this.isDraggableHook(el)),
          this.getDocument(),
          this.isDroppableHook);
      }
      else {
        this.startDrawing(clientX, clientY);
      }
    }
    else {
      this.startDrawing(clientX, clientY);
    }
  }

  startDrawing(clientX, clientY) {
    this.selection.set([]);
    this.handler = new DrawHandler(clientX, clientY, this.getDocument(), this.isSelectableHook);
    this.handler.on('unSelect', e => this.unSelect(e.target, true));
    this.handler.on('select', e => this.select(e.target, true));
  }


  /**
   * Stop dragging
   * @private
   */
  stopDrag() {
    if(this.handler) {
      this.handler.release();
      if(this.handler.type === 'MoveHandler' && this.handler.elementsData) { // not the draw handler
        const elements = this.handler.elementsData.map(data => data.target);
        this.emit('drop', elements.slice());
      }
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
