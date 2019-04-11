import {MouseHandlerBase} from './MouseHandlerBase';
import { StageStore } from '../flux/StageStore';
import { Hooks, MouseData, SelectableState, DropZone } from '../Types';
import { updateSelectables } from '../flux/SelectableState';

export class MoveHandler extends MouseHandlerBase {
  private positionMarker: HTMLElement;
  private selection: Array<SelectableState>;
  constructor(doc: HTMLDocument, store: StageStore, hooks: Hooks) {
    super(doc, store, hooks);

    // store selection
    this.selection = store.getState().selectables.filter(s => s.selected && s.draggable);

    // FIXME: the region marker should be outside the iframe
    this.positionMarker = this.doc.createElement('div');
    this.positionMarker.classList.add('position-marker');

    // add css class
    this.selection.forEach(selectable => selectable.el.classList.add('dragging'));
  }


  /**
   * Called by the Stage class when mouse moves
   */
  update(mouseData: MouseData) {
    super.update(mouseData);

    console.log('TODO: update scroll');
    // PUT THIS IN THE HANDLERS
    // update scroll
    // const scroll = DomMetrics.getScrollToShow(this.doc, '');
    // this.store.dispatch(ScrollAction.set({movementX, movementY, clientX, clientY, shiftKey}));
    // updateScroll(movementX, movementY, clientX, clientY, shiftKey) {
    // handle scroll on the side of the iframe
    // if(this.handler) {
    //   const bb = this.handler.getBoundingBox();
    //   if(bb) {
    //     const update = DomMetrics.getScrollToShow(this.contentDocument, bb);
    //     const updatingScroll = update.x != 0 || update.y != 0;
    //     console.log('bb', bb, update);
    //     // this.handler.update(movementX + update.x, movementY + update.y, clientX + update.x, clientY + update.y, shiftKey);
    //     // if(updatingScroll) setTimeout(_ => this.updateScroll(0, 0, clientX, clientY, shiftKey), 100);
    //     if(updatingScroll) {
    //       setTimeout(_ => updatingScroll = false, 10);
    //     }
    //   }
    // }

    // remove the marker
    if(this.positionMarker.parentNode) this.positionMarker.parentNode.removeChild(this.positionMarker);
    // update elements postition
    this.moveSelectable(this.selection, mouseData.movementX, mouseData.movementY);
    // update the destination of each element
    this.selection.forEach((selectable) => {
      let dropZones = this.findDropZonesUnderMouse(mouseData.mouseX, mouseData.mouseY);
      let nearestPosition = this.findNearestPosition(dropZones, mouseData.mouseX, mouseData.mouseY);
      let dropZoneUnderMouse = dropZones[0]; // the first one is supposed to be the top most one
      switch(selectable.metrics.position) {
        case 'static':
        this.updateDestinationNonAbsolute(selectable, nearestPosition);
        break;
        default:
          this.updateDestinationAbsolute(selectable, dropZoneUnderMouse);
      }
    });
    // update store
    this.store.dispatch(updateSelectables(this.selection));
  }


  /**
   * Called by the Stage class when mouse button is released
   */
  release() {
    super.release();
    this.selection.forEach((selectable) => {
      // reset style
      // selectable.el.style.transform = '';
      selectable.el.classList.remove('dragging');

      // reset relative position
      // selectable.el.style.left = '0';
      // selectable.el.style.top = '0';

      // move to a different container
      if(selectable.dropZone && selectable.dropZone.parent) {
        if(selectable.dropZone.nextElementSibling) {
          // if the target is not allready the sibling of the destination's sibling
          // and if the destination's sibling is not the target itself
          // then move to the desired position in the parent
          if(selectable.dropZone.nextElementSibling !== selectable.el.nextElementSibling && selectable.dropZone.nextElementSibling !== selectable.el) {
            try {
              selectable.el.parentNode.removeChild(selectable.el);
              selectable.dropZone.parent.insertBefore(selectable.el, selectable.dropZone.nextElementSibling);
            }
            catch(e) {
              console.error(e)
            }
          }
        }
        else {
          // if the destination parent is not already the target's parent
          // or if the target is not the last child
          // then append the target to the parent
          if(selectable.dropZone.parent !== selectable.el.parentNode || selectable.el.nextElementSibling) {
            selectable.el.parentNode.removeChild(selectable.el);
            selectable.dropZone.parent.appendChild(selectable.el);
          }
        }
      }
      // check the actual position of the target
      // and move it to match the provided absolute position
      let bb = selectable.el.getBoundingClientRect();
      selectable.metrics.computedStyleRect.top -= bb.top;
      selectable.metrics.computedStyleRect.left -= bb.left;

      // selectable.el.style.left = (clientRect.left - bb.left) + 'px';
      // selectable.el.style.top = (clientRect.top - bb.top) + 'px';

      // selectable.el.style.top = DomMetrics.getStyleValue(selectable.el, this.doc, 'top', {
      //   computedStyle: selectable.computedStyle,
      //   delta: Object.assign({}, selectable.delta, {top: selectable.delta.top + bb.top})
      // });
      // selectable.el.style.left = DomMetrics.getStyleValue(selectable.el, this.doc, 'left', {
      //   computedStyle: selectable.computedStyle,
      //   delta: Object.assign({}, selectable.delta, {top: selectable.delta.left + bb.left})
      // });
    });

    // remove the position marker
    if(this.positionMarker.parentNode) this.positionMarker.parentNode.removeChild(this.positionMarker);

    // update store
    this.store.dispatch(updateSelectables(this.selection));
  }


  /**
   * move an element and update its data in selection
   */
  moveSelectable(selectables: Array<SelectableState>, movementX, movementY) {
    selectables.forEach(selectable => {
      // compute the new position relative to the initial position
      selectable.metrics.clientRect.left += movementX;
      selectable.metrics.clientRect.top += movementY;

      // compute new position in the client area
      selectable.metrics.clientRect.left += movementX;
      selectable.metrics.clientRect.top += movementY;
    });
    // visually move the element
    // selectable.el.style.transform = `translate(${selectable.offsetX}px, ${selectable.offsetY}px)`;
  }


  /**
   * update the destination of the absolutely positioned elements
   */
  updateDestinationAbsolute(selectable: SelectableState, dropZoneUnderMouse) {
    if(dropZoneUnderMouse === null) {
      // FIXME: should fallback on the body?
      console.info('no dropZone under the mouse found, how is it poussible!');
    }
    else {
      selectable.dropZone = {
        parent: dropZoneUnderMouse,
      };
    }
  }


  /**
   * update the destination of the NOT absolutely positioned elements
   * and display a marker in the flow
   */
  updateDestinationNonAbsolute(selectable: SelectableState, nearestPosition) {
    if(nearestPosition.distance === null) {
      // FIXME: should fallback on the body?
      console.info('no nearest position found, how is it poussible?');
    }
    else {
      this.markPosition(nearestPosition);
      selectable.dropZone = nearestPosition;
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
    let bbTargetPrev = this.positionMarker.previousElementSibling ? this.positionMarker.previousElementSibling.getBoundingClientRect() : null;
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
   * find the dropZone elements which are under the mouse
   * the first one in the list is supposed to be the top most one
   */
  findDropZonesUnderMouse(x, y) {
    // get a list of all dropZone zone under the point (x, y)
    return this.doc.elementsFromPoint(x, y)
      .filter((el: HTMLElement) => !this.selection.find(s => s.el === el)
        && this.hooks.canDrop(el, this.selection));
  }

  /**
   * place an empty div (phantom) at each possible place in the dom
   * find the place where it is the nearest from the mouse
   */
  findNearestPosition(dropZones, x, y) {
    // create an empty div to measure distance to the mouse
    let phantom = this.doc.createElement('div');
    phantom.classList.add('phantom');
    // init the result to 'not found'
    let nearestPosition: DropZone = {
      nextElementSibling: null,
      distance: null,
      parent: null,
    };
    // browse all drop zone and find the nearest point
    dropZones.forEach(dropZone => {
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
      nearestPosition.nextElementSibling = this.positionMarker.nextElementSibling as HTMLElement;
    return nearestPosition;
  }
  getDistance(el, x, y) {
    let bb = el.getBoundingClientRect();
    let distance = Math.sqrt(((bb.left - x) * (bb.left - x)) + ((bb.top - y) * (bb.top - y)));
    return distance;
  }
}
