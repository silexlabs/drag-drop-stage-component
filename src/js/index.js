import {Selection, Selectable} from "./Selection";
import {MouseController} from "./MouseController";
import {MoveHandler} from "./MoveHandler";

class Stage {
	constructor(iframe) {
		this.iframe = iframe;
		this.selection = new Selection();
        this.handler = null;
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
		this.selection.toggle(e.target, e.shiftKey);
		console.log('toggleSelect', this.selection.selected);
	}
	drag(e) {
		console.log('drag', this.selection.selected);
        if(this.handler)
            this.handler.update(e);
        else console.log('todo: handle this drag');
	}
	startDrag(e) {
		console.log('startDrag', e.target);
    if(this.selection.isSelected(e.target))
        this.handler = new MoveHandler(this.selection.selected, e);
    else console.log('todo: handle this drag');
	}
	stopDrag(e) {
		console.log('stopDrag', e);
        if(this.handler)
            this.handler.release(e);
        else console.log('todo: handle this drag');
        this.handler = null;
	}
}

exports.Stage = Stage;
if(window) window.Stage = Stage;
