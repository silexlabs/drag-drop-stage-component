class MoveHandler {
  constructor(elements, doc) {
    this.doc = doc;
    this.positionMarker = this.doc.createElement('div');
    this.positionMarker.classList.add('position-marker');
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
  update(e) {
    if(this.positionMarker.parentNode) this.positionMarker.parentNode.removeChild(this.positionMarker);
    let nearestPosition = null;
    let droppableUnderMouse = null;
    this.elementsData.forEach((elementData) => {
      // compute the new position relative to the initial position
      elementData.offsetX += e.movementX;
      elementData.offsetY += e.movementY;
      // compute new position in the client area
      elementData.left += e.movementX;
      elementData.top += e.movementY;
      // visually move the element
      elementData.target.style.transform = `translate(${elementData.offsetX}px, ${elementData.offsetY}px)`;
      switch(elementData.position) {
        case 'static':
          if(nearestPosition === null) {
            nearestPosition = this.findNearestPosition(this.doc, e.clientX, e.clientY);
            if(nearestPosition.distance === null) console.info('no nearest position found, how is it poussible');
            this.markPosition(nearestPosition);
          }
          elementData.destination = nearestPosition;
          break;
        default:
          if(droppableUnderMouse === null) {
            droppableUnderMouse = {
              parent: this.findDroppableUnderMouse(this.doc, e.clientX, e.clientY)
            };
            if(droppableUnderMouse.parent === null) console.info('no droppable under the mouse found, how is it poussible');
          }
          elementData.destination = droppableUnderMouse;
          break;
      }
    });
  }
  release(e) {
    this.elementsData.forEach((elementData) => {
      let el = elementData.target;
      // reset style
      el.style.transform = '';
    });
    if(this.positionMarker.parentNode) this.positionMarker.parentNode.removeChild(this.positionMarker);
  }


  /**
   * @returns an array of the possible drop zones
   */
  getDroppable(doc) {
    let droppableList = doc.querySelectorAll('.droppable');
    let droppable = [];
    for(let idx=0; idx<droppableList.length; idx++) {
      // only the not selected droppable elements
      // TODO: abstraction for getSelectable and getDroppable and getSelected
      if(!droppableList[idx].closest('.selected'))
        droppable.push(droppableList[idx]);
    }
    return droppable;    
  }
  /**
   * display the position marker atthe given positionin the dom
   */
  markPosition(position) {
    if(position.nextSibling) {
      position.nextSibling.parentNode.insertBefore(this.positionMarker, position.nextSibling);
    }
    else if(position.parent) {
      position.parent.appendChild(this.positionMarker);
    }
    let bbMarker = this.positionMarker.getBoundingClientRect();
    let bbTargetPrev = this.positionMarker.previousSibling ? this.positionMarker.previousSibling.getBoundingClientRect() : null;
    let bbTargetNext = this.positionMarker.nextSibling ? this.positionMarker.nextSibling.getBoundingClientRect() : null;
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
   * find the top most element which is under the mouse
   */
  findDroppableUnderMouse(doc, x, y) {
    // does not work because the dragged element is under the mouse:
    // let hovered = doc.querySelectorAll( '.droppable:hover' );
    // does not work because the dragged element is under the mouse:
    // let element = doc.elementFromPoint(x, y);
    // get a list of all droppable zone under the point (x, y)
    let droppable = this.getDroppable(doc).filter(dropZone => {
      let bb = dropZone.getBoundingClientRect();
      return bb.left < x && bb.right > x 
        && bb.top < y && bb.bottom > y;      
    });
    // the last one in the list is supposed to be the top most one
    return droppable.length>0 ? droppable[droppable.length-1] : null;
  }


  /**
   * place an empty div (phantom) at each possible place in the dom
   * find the place where it is the nearest from the mouse
   */
  findNearestPosition(doc, x, y) {
    // create an empty div to measure distance to the mouse
    let phantom = doc.createElement('div');
    phantom.classList.add('phantom');
    // get a list of all droppable zone under the point (x, y)
    let droppable = this.getDroppable(doc).filter(dropZone => {
      let bb = dropZone.getBoundingClientRect();
      return bb.left < x && bb.right > x 
        && bb.top < y && bb.bottom > y;      
    });
    // init the result to 'not found'
    let nearestPosition = {
      nextSibling: null,
      distance: null,
    };
    // browse all drop zone and find the nearest point
    for(let dropZone of droppable) {
      for(let idx=0; idx<dropZone.childNodes.length; idx++) {
        let sibling = dropZone.childNodes[idx];
        dropZone.insertBefore(phantom, sibling);
        let distance = this.getDistance(phantom, x, y);
        if(nearestPosition.distance === null || nearestPosition.distance > distance) {
          nearestPosition.nextSibling = sibling;
          nearestPosition.parent = dropZone;
          nearestPosition.distance = distance;
        }
        dropZone.removeChild(phantom);
      }
      // test the last position
      dropZone.appendChild(phantom);
      let distance = this.getDistance(phantom, x, y);
      if(nearestPosition.distance === null || nearestPosition.distance > distance) {
        nearestPosition.nextSibling = null;
        nearestPosition.parent = dropZone;
        nearestPosition.distance = distance;
      }
      dropZone.removeChild(phantom);
    }
    return nearestPosition;
  }
  getDistance(el, x, y) {
    let bb = el.getBoundingClientRect();
    let distance = Math.sqrt(((bb.left - x) * (bb.left - x)) + ((bb.top - y) * (bb.top - y)));
    return distance;
  }
}

exports.MoveHandler = MoveHandler;
