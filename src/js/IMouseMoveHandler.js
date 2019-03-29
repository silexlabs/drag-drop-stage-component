import Event from "emitter-js";

export class IMouseMoveHandler extends Event {
  constructor() {
    super();
    this.type = 'IMouseMoveHandler';
  }
  update(movementX, movementY, mouseX, mouseY) {};
  release() {};
}