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
      elementData.target.style.width = elementData.computedStyle.width + 'px';
      elementData.target.style[heightAttr] = elementData.computedStyle.height + 'px';
      // handle the position change
      if(this.direction.x === 'left') {
        elementData.computedStyle.left += movementX;
      }
      if(this.direction.y === 'top') {
        elementData.computedStyle.top += movementY;
      }
      // apply the position
      elementData.target.style.left = elementData.computedStyle.left + 'px';
      elementData.target.style.top = elementData.computedStyle.top + 'px';
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
