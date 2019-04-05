import {MouseHandlerBase} from './MouseHandlerBase.js';
import * as DomMetrics from '../utils/DomMetrics.js';

export class DrawHandler extends MouseHandlerBase {
  constructor(initialX, initialY, doc, isSelectableHook) {
    super();
    this.type = 'DrawHandler';
    // store the iframe document and initial coords
    this.doc = doc;
    this.initialX = initialX;
    this.initialY = initialY;
    this.isSelectableHook = isSelectableHook;
    // create and attach a div to draw the region
    // FIXME: the region marker should be outside the iframe
    this.regionMarker = this.doc.createElement('div');
    this.regionMarker.classList.add('region-marker');
    this.moveRegion(-999, -999, -999, -999);
    doc.body.appendChild(this.regionMarker);
    // build the data for all the elements
    // TODO: use continuation or a worker to prevent lag?
    this.elementsData = DomMetrics.getElementsData(Array
      .from(doc.querySelectorAll('*'))
      .filter(el => this.isSelectableHook(el)));
    // the elements which are in the region
    this.elements = [];
  }

  update(movementX, movementY, mouseX, mouseY, shiftKey) {
    super.update(movementX, movementY, mouseX, mouseY, shiftKey)
    // update the drawing
    this.moveRegion(this.initialX, this.initialY, mouseX, mouseY);
    // select all elements which intersect with the region
    let newSelection = this.elementsData
    .filter(data => {
      return data.clientRect.left < Math.max(this.initialX, mouseX) &&
      data.clientRect.right > Math.min(this.initialX, mouseX) &&
      data.clientRect.top < Math.max(this.initialY, mouseY) &&
      data.clientRect.bottom > Math.min(this.initialY, mouseY);
    })
    .map(data => data.target);
    // handle removed elements
    this.elements
    .filter(el => !newSelection.includes(el))
    .forEach(el => {
      this.emit('unSelect', {
        target: el,
      });
    });
    // handle added elements
    newSelection
    .filter(el => !this.elements.includes(el))
    .forEach(el => {
      this.emit('select', {
        target: el,
      });
    });
    // store the new selection
    this.elements = newSelection;
  }


  release() {
    super.release();
    this.regionMarker.parentNode.removeChild(this.regionMarker);
    this.elements = [];
  }

  /**
   * display the position marker atthe given positionin the dom
   */
  moveRegion(left, top, right, bottom) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;

    if(left > right) {
      this.moveRegion(right, top, left, bottom);
    }
    else if(top > bottom) {
      this.moveRegion(left, bottom, right, top);
    }
    else {
      const scrollX = (this.doc.parentWindow || this.doc.defaultView).scrollX;
      const scrollY = (this.doc.parentWindow || this.doc.defaultView).scrollY;
      this.regionMarker.style.width = (right - left) + 'px';
      this.regionMarker.style.height = (bottom - top) + 'px';
      this.regionMarker.style.transform = `translate(${left+scrollX}px, ${top+scrollY}px)`; // scale(${width}, ${height})
    }
  }
  getBoundingBox() {
    return {
      left: this.left,
      top: this.top,
      right: this.right,
      bottom: this.bottom,
      width: Math.abs(this.right - this.left),
      height: Math.abs(this.bottom - this.top),
    }
  }
}

exports.DrawHandler = DrawHandler;
