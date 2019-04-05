import Event from 'emitter-js';

export class MouseHandlerBase extends Event {
  constructor() {
    super();
    this.type = 'MouseHandlerBase';
  }
  update(movementX, movementY, mouseX, mouseY, shiftKey) {};
  release() {};
}