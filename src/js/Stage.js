import {Selection, Selectable} from "./Selection";
import {MouseController} from "./MouseController";
import {MoveHandler} from "./MoveHandler";
import Event from "emitter-js";

class Stage extends Event  {
	constructor(iframe) {
    super();
		// store the iframe and use its document and window
		this.iframe = iframe;
		// create useful classes
		this.selection = new Selection();
    this.handler = null;
    // load styles for the UI in the iframe
    var doc = this.getDocument();
    var link = doc.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', /*FIXME: Url.makeAbsolute*/('css/stage.css'));
    doc.head.appendChild(link);
    // register mouse events
    let mouseController = new MouseController(this.getWindow());
		mouseController.on('toggleSelect', (e) => this.toggleSelect(e));
		mouseController.on('drag', (e) => this.drag(e));
		mouseController.on('startDrag', (e) => this.startDrag(e));
		mouseController.on('stopDrag', (e) => this.stopDrag(e));
	}
	getIFrame() {
		return this.iframe;
	}
	getDocument() {
		return this.iframe.contentDocument;
	}
	getWindow() {
		return this.iframe.contentWindow;
	}
	toggleSelect(e) {
    let selectable = this.selection.getSelectable(e.target);
    if(selectable) {
      if(e.shiftKey)
        // add or remove
        this.selection.toggle(selectable, e.shiftKey);
      else
        // select this one and only this one
    		this.selection.set([selectable]);
    }
    else console.info('element is not selectable');
  }
  drag(e) {
    if(this.handler)
        this.handler.update(e.movementX, e.movementY, e.clientX, e.clientY);
  }
  startDrag(e) {
    let selectable = this.selection.getSelectable(e.target);
    if(selectable) {
      if(this.selection.isSelected(selectable))
          this.handler = new MoveHandler(this.selection.selected, this.getDocument());
      else console.log('todo: handle this drag');
    }
    else console.info('element is not selectable');
	}
	stopDrag(e) {
    if(this.handler) {
      this.handler.release();
      e.elementsData = this.handler.elementsData;
      this.emit('drop', e);
    }
    this.handler = null;
	}
}

exports.Stage = Stage;
if(window) window.Stage = Stage;
