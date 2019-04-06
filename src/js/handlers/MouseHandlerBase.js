import Event from 'emitter-js';

export class MouseHandlerBase extends Event {
  constructor() {
    super();
    this.type = 'MouseHandlerBase';
  }
  update(mouseHandlerData) {};
  release() {};
}
