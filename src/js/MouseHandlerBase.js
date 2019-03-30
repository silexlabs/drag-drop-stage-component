import Event from "emitter-js";

export class MouseHandlerBase extends Event {
  static getElementsData(elements) {
    return elements.map((target) => {
      let style = window.getComputedStyle(target);
      let bb = target.getBoundingClientRect();

      const clientRect = {
        top: bb.top,
        left: bb.left,
        bottom: bb.bottom,
        right: bb.right,
        width: bb.width,
        height: bb.height,
      };
      const computedStyle = {
        position: style.getPropertyValue('position'),

        width: bb.width,
        height: bb.height,
        left: bb.left,
        top: bb.top,

        borderLeft: parseInt(style.getPropertyValue('border-left-width')) || 0,
        borderTop: parseInt(style.getPropertyValue('border-top-width')) || 0,
        borderRight: parseInt(style.getPropertyValue('border-right-width')) || 0,
        borderBottom: parseInt(style.getPropertyValue('border-bottom-width')) || 0,

        paddingLeft: parseInt(style.getPropertyValue('padding-left')) || 0,
        paddingTop: parseInt(style.getPropertyValue('padding-top')) || 0,
        paddingRight: parseInt(style.getPropertyValue('padding-right')) || 0,
        paddingBottom: parseInt(style.getPropertyValue('padding-bottom')) || 0,

        marginLeft: parseInt(style.getPropertyValue('margin-left')) || 0,
        marginTop: parseInt(style.getPropertyValue('margin-top')) || 0,
        marginRight: parseInt(style.getPropertyValue('margin-right')) || 0,
        marginBottom: parseInt(style.getPropertyValue('margin-bottom')) || 0,
      };
      const delta = {
        left: computedStyle.marginLeft,
        width: computedStyle.paddingLeft + computedStyle.paddingRight + computedStyle.borderLeft + computedStyle.borderRight,
        right: computedStyle.marginLeft + computedStyle.paddingLeft + computedStyle.paddingRight + computedStyle.borderLeft + computedStyle.borderRight,
        top: computedStyle.marginTop,
        height: computedStyle.borderTop + computedStyle.borderBottom + computedStyle.paddingTop + computedStyle.paddingBottom,
        bottom: computedStyle.marginTop + computedStyle.paddingTop + computedStyle.paddingBottom + computedStyle.borderTop + computedStyle.borderBottom,
      };

      return {
        target,
        computedStyle,
        clientRect,
        delta,
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