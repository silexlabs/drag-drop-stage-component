import Event from "emitter-js";

class DrawHandler extends Event {
  constructor(initialX, initialY, doc) {
    super();
    // store the iframe document and initial coords
    this.doc = doc;
    this.initialX = initialX;
    this.initialY = initialY;
    // create and attach a div to draw the region
    // FIXME: the region marker should be outside the iframe
    this.regionMarker = this.doc.createElement('div');
    this.regionMarker.classList.add('region-marker');
    this.moveRegion(-999, -999, -999, -999);
    doc.body.appendChild(this.regionMarker);
    // the elements which are in the region
    this.elements = [];
  }

  update(movementX, movementY, mouseX, mouseY) {
    // update the drawing
    this.moveRegion(this.initialX, this.initialY, mouseX, mouseY);
    // add and remove elements depending on wether they are in the region
    let newSelection = [];
    // browse every 10 pixels of the region to see which elements are hovered
    let startX = Math.min(this.initialX, mouseX);
    let endX = Math.max(this.initialX, mouseX);
    let startY = Math.min(this.initialY, mouseY);
    let endY = Math.max(this.initialY, mouseY);
    for (let x = startX; x < endX; x += 10) {
      for (let y = startY; y < endY; y += 10) {
        newSelection = newSelection.concat(
          this.doc.elementsFromPoint(x, y)
          .filter(el => el.classList.contains('selectable') && !newSelection.includes(el))
        );
      }
    }
    // handle removed elements
    this.elements.filter(el => !newSelection.includes(el)).forEach(el => {
      this.emit('toggleSelect', {
        target: el,
      });
    });
    // handle added elements
    newSelection.filter(el => !this.elements.includes(el)).forEach(el => {
      this.emit('toggleSelect', {
        target: el,
      });
    });
    // store the new selection
    this.elements = newSelection;
  }


  release() {
    this.regionMarker.parentNode.removeChild(this.regionMarker);
    this.elements = [];
  }

  /**
   * display the position marker atthe given positionin the dom
   */
  moveRegion(left, top, right, bottom) {
    if(left > right) {
      this.moveRegion(right, top, left, bottom);
    }
    else if(top > bottom) {
      this.moveRegion(left, bottom, right, top);
    }
    else {
      this.regionMarker.style.width = (right - left) + 'px';
      this.regionMarker.style.height = (bottom - top) + 'px';
      this.regionMarker.style.transform = `translate(${left}px, ${top}px)`; // scale(${width}, ${height})
    }
  }
}

exports.DrawHandler = DrawHandler;
