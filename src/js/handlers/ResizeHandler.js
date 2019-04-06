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

  constructor(doc, store) {
    super();
    this.type = 'ResizeHandler';
    this.doc = doc;
    this.store = store;
    // store the selection
    this.selection = this.store.getState().selectables
    .filter(selectable => selectable.selected);
    // add a style
    this.selection
    .forEach(selectable => selectable.el.classList.add('resizing'));
  }

  /**
   * Called by the Stage class when mouse moves
   */
  update(movementX, movementY, mouseX, mouseY, shiftKey) {
    super.update(movementX, movementY, mouseX, mouseY, shiftKey);

    // TODO: update scroll

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
}
