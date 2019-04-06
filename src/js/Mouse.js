import "mouse";
import Event from 'emitter-js';

let State = {
  UP: 'UP',
  DOWN: 'DOWN',
  DRAGGING: 'DRAGGING'
}

class Mouse extends Event {
  constructor(win) {
    super();

    // get the Mouse class through the only instance we can get
    this.mouse = new window.mouse.constructor(win);

    this.state = State.UP;
    win.addEventListener('scroll', (e) => this.scroll(e), true);
    this.mouse.on('down', (e) => this.down(e));
    this.mouse.on('up', (e) => this.up(e));
    this.mouse.on('grab', (e) => this.grab(e));
    this.mouse.on('drop', (e) => this.drop(e));
    this.mouse.on('move', (e) => this.move(e));
  }
  emit(type, e) {
    console.log('emit', type, e.target, e.movementX);
    super.emit(type, e);
  }
  scroll(e) {
    e.preventDefault();
    this.emit('scroll', e);
  }
  down(e) {
    e.preventDefault(); // prevent default text selection
    this.state = State.DOWN;
    this.emit('down', e);
  }
  up(e) {
    e.preventDefault();
    if(this.state === State.DOWN) {
      this.emit('up', e);
    }
    else if (this.state === State.DRAGGING) {
      this.emit('stopDrag', e);
    }
    this.state = State.UP;
  }
  grab(e) {
    e.preventDefault();
    this.state = State.DOWN;
  }
  drop(e) {
    e.preventDefault();
    if(this.state === State.DRAGGING) {
      this.state = State.UP;
      this.emit('stopDrag', e);
    }
  }
  move(e) {
    e.preventDefault();
    switch(this.state) {
      case State.DOWN:
        this.state = State.DRAGGING;
        this.emit('startDrag', e);
        break;
      case State.DRAGGING:
        this.emit('drag', e);
        break;
      default:
       this.emit('move', e);
    }
  }
}

exports.Mouse = Mouse;
