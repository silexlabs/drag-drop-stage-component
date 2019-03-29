import {IMouseMoveHandler} from './IMouseMoveHandler.js';

class MoveHandler extends IMouseMoveHandler {
  constructor(elements, doc, isDroppableHook) {
    super();
    this.type = 'MoveHandler';
    this.isDroppableHook = isDroppableHook;
    // store the iframe document
    this.doc = doc;
    // FIXME: the region marker should be outside the iframe
    this.positionMarker = this.doc.createElement('div');
    this.positionMarker.classList.add('position-marker');
    this.elements = elements;
    this.elementsData = elements.map((el) => {
      let style = window.getComputedStyle(el);
      let bb = el.getBoundingClientRect();
      return {
        target: el,
        offsetX: 0, // relative translation
        offsetY: 0, // relative translation
        position: style.position,
        left: bb.left,
        top: bb.top,
      };
    });
  }


  /**
   * Called by the Stage class when mouse moves
   */
  update(movementX, movementY, mouseX, mouseY) {
    if(this.positionMarker.parentNode) this.positionMarker.parentNode.removeChild(this.positionMarker);
    // update the destination of each element
    this.elementsData.forEach((elementData) => {
      let droppables = this.findDroppablesUnderMouse(mouseX, mouseY);
      let nearestPosition = this.findNearestPosition(droppables, mouseX, mouseY);
      let droppableUnderMouse = droppables[0]; // the first one is supposed to be the top most one
      this.moveElementData(elementData, movementX, movementY);
      switch(elementData.position) {
        case 'static':
        this.updateDestinationNonAbsolute(elementData, nearestPosition);
        break;
        default:
          this.updateDestinationAbsolute(elementData, droppableUnderMouse);
      }
    });
  }


  /**
   * Called by the Stage class when mouse button is released
   */
  release() {
    super.release();
    this.elementsData.forEach((elementData) => {
      let el = elementData.target;
      // reset style
      el.style.transform = '';
    });
    if(this.positionMarker.parentNode) this.positionMarker.parentNode.removeChild(this.positionMarker);
  }


  /**
   * move an element and update its data in elementsData
   */
  moveElementData(elementData, movementX, movementY) {
    // compute the new position relative to the initial position
    elementData.offsetX += movementX;
    elementData.offsetY += movementY;
    // compute new position in the client area
    elementData.left += movementX;
    elementData.top += movementY;
    // visually move the element
    elementData.target.style.transform = `translate(${elementData.offsetX}px, ${elementData.offsetY}px)`;
  }


  /**
   * update the destination of the absolutely positioned elements
   */
  updateDestinationAbsolute(elementData, droppableUnderMouse) {
    if(droppableUnderMouse === null) {
      // FIXME: should fallback on the body?
      console.info('no droppable under the mouse found, how is it poussible!');
    }
    else {
      elementData.destination = {
        parent: droppableUnderMouse,
      };
    }
  }


  /**
   * update the destination of the NOT absolutely positioned elements
   * and display a marker in the flow
   */
  updateDestinationNonAbsolute(elementData, nearestPosition) {
    if(nearestPosition.distance === null) {
      // FIXME: should fallback on the body?
      console.info('no nearest position found, how is it poussible?');
    }
    else {
      this.markPosition(nearestPosition);
      elementData.destination = nearestPosition;
    }
  }


  /**
   * display the position marker atthe given positionin the dom
   */
  markPosition(position) {
    if(position.nextElementSibling) {
      position.nextElementSibling.parentNode.insertBefore(this.positionMarker, position.nextElementSibling);
    }
    else if(position.parent) {
      position.parent.appendChild(this.positionMarker);
    }
    let bbMarker = this.positionMarker.getBoundingClientRect();
    let bbTargetPrev = this.positionMarker.previousSibling ? this.positionMarker.previousSibling.getBoundingClientRect() : null;
    let bbTargetNext = this.positionMarker.nextElementSibling ? this.positionMarker.nextElementSibling.getBoundingClientRect() : null;
    if((!bbTargetPrev || bbMarker.top >= bbTargetPrev.bottom)
      && (!bbTargetNext || bbMarker.bottom <= bbTargetNext.top)) {
      // horizontal
      this.positionMarker.style.width = bbTargetPrev ? bbTargetPrev.width + 'px' : bbTargetNext ? bbTargetNext.width + 'px' : '100%';
      this.positionMarker.style.height = '0';
    }
    else {
      // vertical
      this.positionMarker.style.height = bbTargetPrev ? bbTargetPrev.height + 'px' : bbTargetNext ? bbTargetNext.height + 'px' : '100%';
      this.positionMarker.style.width = '0';
    }
  }


  /**
   * find the droppable elements which are under the mouse
   * the first one in the list is supposed to be the top most one
   */
  findDroppablesUnderMouse(x, y) {
    // get a list of all droppable zone under the point (x, y)
    return this.doc.elementsFromPoint(x, y)
      .filter(el => !this.elements.includes(el)
        && this.isDroppableHook(el, this.elements));
  }

  /**
   * place an empty div (phantom) at each possible place in the dom
   * find the place where it is the nearest from the mouse
   */
  findNearestPosition(droppables, x, y) {
    // create an empty div to measure distance to the mouse
    let phantom = this.doc.createElement('div');
    phantom.classList.add('phantom');
    // init the result to 'not found'
    let nearestPosition = {
      nextElementSibling: null,
      distance: null,
    };
    // browse all drop zone and find the nearest point
    droppables.forEach(dropZone => {
      for(let idx=0; idx<dropZone.childNodes.length; idx++) {
        let sibling = dropZone.childNodes[idx];
        dropZone.insertBefore(phantom, sibling);
        let distance = this.getDistance(phantom, x, y);
        if(nearestPosition.distance === null || nearestPosition.distance > distance) {
          nearestPosition.nextElementSibling = sibling;
          nearestPosition.parent = dropZone;
          nearestPosition.distance = distance;
        }
        dropZone.removeChild(phantom);
      }
      // test the last position
      dropZone.appendChild(phantom);
      let distance = this.getDistance(phantom, x, y);
      if(nearestPosition.distance === null || nearestPosition.distance > distance) {
        nearestPosition.nextElementSibling = null;
        nearestPosition.parent = dropZone;
        nearestPosition.distance = distance;
      }
      dropZone.removeChild(phantom);
    });
    // the next element can not be our position marker (it happens)
    if(nearestPosition.nextElementSibling === this.positionMarker)
      nearestPosition.nextElementSibling = this.positionMarker.nextSibling;
    return nearestPosition;
  }
  getDistance(el, x, y) {
    let bb = el.getBoundingClientRect();
    let distance = Math.sqrt(((bb.left - x) * (bb.left - x)) + ((bb.top - y) * (bb.top - y)));
    return distance;
  }
}

exports.MoveHandler = MoveHandler;
