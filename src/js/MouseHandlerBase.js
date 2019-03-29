import Event from "emitter-js";

export class MouseHandlerBase extends Event {
  static getElementsData(elements) {
    return elements.map((el) => {
      let style = window.getComputedStyle(el);
      let bb = el.getBoundingClientRect();
      return {
        target: el,
        clientRect: {
          top: bb.top,
          left: bb.left,
          bottom: bb.bottom,
          right: bb.right,
          width: bb.width,
          height: bb.height,
        },
        computedStyle: {
          position: style.getPropertyValue('position'),

          width: bb.width,
          height: bb.height,
          left: bb.left,
          top: bb.top,

          // width: el.offsetWidth,
          // height: el.offsetHeight,
          // left: el.offsetLeft,
          // top: el.offsetTop,

          // width: parseInt(style.getPropertyValue('width')) || 0,
          // height: parseInt(style.getPropertyValue('height')) || 0,
          // left: parseInt(style.getPropertyValue('left')) || 0,
          // top: parseInt(style.getPropertyValue('top')) || 0,
        },
        initialRatio: bb.height / (bb.width ? bb.width : 1),
        destination: null,
        offsetX: 0,
        offsetY: 0,
      };
    });
  }
  constructor() {
    super();
    this.type = 'MouseHandlerBase';
  }
  update(movementX, movementY, mouseX, mouseY, shiftKey) {};
  release() {};
}