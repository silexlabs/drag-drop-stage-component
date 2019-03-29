import Event from "emitter-js";

export class IMouseMoveHandler extends Event {
  constructor() {
    super();
    this.elementsData = [];
  }
  update(movementX, movementY, mouseX, mouseY) {};
  release() {};
}