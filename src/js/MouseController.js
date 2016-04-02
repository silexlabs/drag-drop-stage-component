import "mouse";
import EventEmitter from "smelly-event-emitter";

let State = {
	UP: 'UP',
	DOWN: 'DOWN',
	DRAGGING: 'DRAGGING'
}

class MouseController extends EventEmitter {
	constructor(win) {
		super();
		console.log('MouseController', win);
		this.mouse = new Mouse(win);

		this.state = State.UP;
		this.mouse.on('down', (e) => this.down(e));
		this.mouse.on('up', (e) => this.up(e));
		this.mouse.on('grab', (e) => this.grab(e));
		this.mouse.on('drop', (e) => this.drop(e));
		this.mouse.on('move', (e) => this.move(e));
	}
	emit(type, e) {
		// console.log('emit', type, e.target, e.movementX);
		super.emit(type, e);
	}
	down(e) {
		let element = e.target;
		// prevent default text selection
		e.preventDefault();
	}
	up(e) {
		let element = e.target;
		if(this.state === State.UP) {
			this.emit('toggleSelect', e);
		}
		else if (this.state === State.DOWN) {
			this.state = State.UP;
		}
	}
	grab(e) {
		this.state = State.DOWN;
	}
	drop(e) {
		if(this.state !== State.UP) {
			this.state = State.UP;
			this.emit('stopDrag', e);
		}
		e.preventDefault();
	}
	move(e) {
		switch(this.state) {
			case State.DOWN:
				this.state = State.DRAGGING;
				this.emit('startDrag', e);
				break;
			case State.DRAGGING:
				this.emit('drag', e);
				break;
		}
	}
}

exports.MouseController = MouseController;
