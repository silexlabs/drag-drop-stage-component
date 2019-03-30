import {MouseHandlerBase} from './MouseHandlerBase.js';

export const BORDER_SIZE = 10;

export class ResizeHandler extends MouseHandlerBase {
  static getDirection(clientX, clientY, selectable) {
    const bb = selectable.getBoundingClientRect();
    const distFromBorder = {
      left: clientX - bb.left,
      right: bb.width + bb.left - clientX,
      top: clientY - bb.top,
      bottom: bb.height + bb.top - clientY,
    }
    // get resize direction
    const direction = { x: '', y: '' };
    if(distFromBorder.left < BORDER_SIZE) direction.x = 'left';
    else if(distFromBorder.right < BORDER_SIZE) direction.x = 'right';
    if(distFromBorder.top < BORDER_SIZE) direction.y = 'top';
    else if(distFromBorder.bottom < BORDER_SIZE) direction.y = 'bottom';

    return direction;
  }


  constructor(elements, doc, {useMinHeightHook, direction}) {
    super();
    this.doc = doc;
    this.type = 'ResizeHandler';
    this.useMinHeightHook = useMinHeightHook;
    this.elements = elements;
    this.direction = direction;
    // add a style
    elements.forEach(el => el.classList.add('resizing'));
    // build the data for all the elements
    this.elementsData = MouseHandlerBase.getElementsData(elements);
  }

  /**
   * Called by the Stage class when mouse moves
   */
  update(movementX, movementY, mouseX, mouseY, shiftKey) {
    super.update(movementX, movementY, mouseX, mouseY, shiftKey);
    this.elementsData.forEach((elementData) => {
      // handle the width and height computation
      const heightAttr = this.useMinHeightHook(elementData.target) ? 'minHeight' : 'height';
      switch(this.direction.x) {
        case '':
          break;
        case 'left':
          elementData.computedStyle.width -= movementX;
          break;
        case 'right':
          elementData.computedStyle.width += movementX;
          break;
        default: throw new Error('unknown direction ' + this.direction.x);
      }
      if(this.direction.y != '') {
        if(shiftKey && this.direction.x != '' && this.direction.y != '') {
          elementData.computedStyle.height = elementData.computedStyle.width * elementData.initialRatio;
        }
        else {
          if(this.direction.y === 'top') {
            elementData.computedStyle.height -= movementY;
          }
          else {
            elementData.computedStyle.height += movementY;
          }
        }
      }
      // apply the with and height
      elementData.target.style.width = Math.round(elementData.computedStyle.width - elementData.delta.width) + 'px';
      elementData.target.style[heightAttr] = Math.round(elementData.computedStyle.height - elementData.delta.height) + 'px';

      // handle the position change
      if(this.direction.x === 'left') {
        // compute the change
        elementData.computedStyle.left += movementX;
        // apply the position
        // TODO: should we handle other scroll than the window?
        const scroll = (this.doc.parentWindow || this.doc.defaultView).scrollX;
        elementData.target.style.left = Math.round(elementData.computedStyle.left + scroll - elementData.delta.left) + 'px';
      }
      if(this.direction.y === 'top') {
        // correction when the content is too big
        const bb = elementData.target.getBoundingClientRect();
        // compute the change
        elementData.computedStyle.top += movementY;
        // apply the position
        // TODO: should we handle other scroll than the window?
        const scroll = (this.doc.parentWindow || this.doc.defaultView).scrollY;
        const delta = bb.height - elementData.computedStyle.height;
        elementData.target.style.top = Math.round(elementData.computedStyle.top + scroll - elementData.delta.top - delta) + 'px';
      }
    });
  }


  /**
   * Called by the Stage class when mouse button is released
   */
  release() {
    super.release();
    this.elements.forEach(el => el.classList.remove('resizing'));
  }
}
