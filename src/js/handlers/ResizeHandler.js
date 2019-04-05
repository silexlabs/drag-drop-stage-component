import {MouseHandlerBase} from './MouseHandlerBase';
import * as Ui from '../store/Ui';

export const BORDER_SIZE = 10;

export class ResizeHandler extends MouseHandlerBase {
  static getDirection(clientX, clientY, selectable) {
    const bb = selectable.metrics.clientRect;
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

  static getCursorClass(direction) {
    if(direction.x === '' && direction.y === '') return Ui.CURSOR_DEFAULT;
    else if(direction.x === 'left' && direction.y === 'top') return Ui.CURSOR_NW;
    else if(direction.x === 'right' && direction.y === 'top') return Ui.CURSOR_NE;
    else if(direction.x === 'left' && direction.y === 'bottom') return Ui.CURSOR_SW;
    else if(direction.x === 'right' && direction.y === 'bottom') return Ui.CURSOR_SE;
    else if(direction.x === 'left' && direction.y === '') return Ui.CURSOR_W;
    else if(direction.x === 'right' && direction.y === '') return Ui.CURSOR_E;
    else if(direction.x === '' && direction.y === 'top') return Ui.CURSOR_N;
    else if(direction.x === '' && direction.y === 'bottom') return Ui.CURSOR_S;
    throw new Error('direction not found');
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
    this.elementsData = DomMetrics.getElementsData(elements);
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
      elementData.target.style.width = DomMetrics.getStyleValue(elementData.target, this.doc, 'width', elementData) ;
      elementData.target.style[heightAttr] = DomMetrics.getStyleValue(elementData.target, this.doc, 'height', elementData);

      // handle the position change
      if(this.direction.x === 'left') {
        // compute the change
        elementData.computedStyle.left += movementX;
        // apply the position
        elementData.target.style.left = DomMetrics.getStyleValue(elementData.target, this.doc, 'left', elementData);
      }
      if(this.direction.y === 'top') {
        // correction when the content is too big
        const bb = elementData.target.getBoundingClientRect();
        // compute the change
        elementData.computedStyle.top += movementY;
        // apply the position
        // handle the case where the content is too small
        const delta = bb.height - elementData.computedStyle.height;
        console.log('delta', delta)
        elementData.target.style.top = DomMetrics.getStyleValue(elementData.target, this.doc, 'top', {
          computedStyle: elementData.computedStyle,
          delta: Object.assign({}, elementData.delta, {top: elementData.delta.top - delta})
        });
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
  getBoundingBox() {
    DomMetrics.getBoundingBox(this.elements);
  }
}
