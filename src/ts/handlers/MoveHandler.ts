import {MouseHandlerBase} from './MouseHandlerBase';
import { StageStore } from '../flux/StageStore';
import { Hooks, SelectableState, MouseData, DropZone, EMPTY_BOX } from '../Types';
import * as selectableState from '../flux/SelectableState'
import * as domMetrics from '../utils/DomMetrics';
import { setRefreshing, setSticky } from '../flux/UiState';
import { STICK_DISTANCE } from '../Constants';

export class MoveHandler extends MouseHandlerBase {
  private positionMarker: HTMLElement;
  private initialMouse: {x:number, y:number};

  constructor(stageDocument: HTMLDocument, overlayDocument: HTMLDocument, store: StageStore, hooks: Hooks) {
    super(stageDocument, overlayDocument, store, hooks);

    // keep only draggable elements
    // which are not in a selected element also being dragged
    this.selection = this.selection
    .filter(s => s.draggable)
    .filter(s => !domMetrics.hasASelectedDraggableParent(store, s.el));

    // notify the app
    if(!!this.hooks.onStartDrag) this.hooks.onStartDrag(this.selection);

    // FIXME: the region marker should be outside the iframe
    this.positionMarker = this.stageDocument.createElement('div');
    this.positionMarker.classList.add('position-marker');
    this.positionMarker.style.backgroundColor = 'rgba(0, 0, 0, .5)';
    this.positionMarker.style.display = 'inline-block';
    this.positionMarker.style.border = '1px solid rgba(255, 255, 255, .5)';
    this.positionMarker.style.position = 'absolute';
    this.positionMarker.style.minWidth = '1px';
    this.positionMarker.style.minHeight = '1px';

    // update state
    this.selection = this.selection.map(selectable => {
      return {
        ...selectable,
        preventMetrics: true,
        translation: {
          x: 0,
          y: 0,
        },
      };
    });

    // update store
    this.store.dispatch(selectableState.updateSelectables(this.selection));
  }


  /**
   * Called by the Stage class when mouse moves
   */
  update(mouseData: MouseData) {
    super.update(mouseData);

    // remove the marker
    if(this.positionMarker.parentNode) this.positionMarker.parentNode.removeChild(this.positionMarker);

    if(!this.initialMouse) {
      this.initialMouse = {
        x: mouseData.mouseX - mouseData.movementX,
        y: mouseData.mouseY - mouseData.movementY,
      };
    }

    // apply constraints (shift) and
    // compute the real movementX and movementY based on the position of the mouse instead of the position of the selection
    const { movementX, movementY } = (() => {
      const translation = this.selection[0].translation;
      const realMovementX = -translation.x + (mouseData.mouseX - this.initialMouse.x);
      const realMovementY = -translation.y + (mouseData.mouseY - this.initialMouse.y);
      if(mouseData.shiftKey && this.selection.length > 0) {
        const {x, y} = {
          x: mouseData.mouseX - this.initialMouse.x,
          y: mouseData.mouseY - this.initialMouse.y,
        }
        const angle = Math.atan2(y, x);
        if(Math.abs(Math.sin(angle)) < Math.abs(Math.cos(angle))) {
          // stick to x axis
          return {
            movementX: realMovementX,
            movementY: -translation.y,
          }
        } else {
          // stick to y axis
          return {
            movementX: -translation.x,
            movementY: realMovementY,
          }
        }
      }
      return {
        movementX: realMovementX,
        movementY: realMovementY,
      };
    })()

    // apply constraints (sticky)
    const bb = domMetrics.getBoundingBox(this.selection);
    const hasPositionedElements = this.selection.some(s => s.metrics.position === 'static');
    const sticky = !this.store.getState().ui.enableSticky || hasPositionedElements ? EMPTY_BOX()
      : this.store.getState().selectables
        .filter(s => !s.selected && s.selectable && s.metrics.position !== 'static')
        .reduce((prev, selectable) => {
          if(Math.abs(selectable.metrics.clientRect.top - (bb.top + movementY)) < STICK_DISTANCE) prev.top = selectable.metrics.clientRect.top - bb.top;
          if(Math.abs(selectable.metrics.clientRect.left - (bb.left + movementX)) < STICK_DISTANCE) prev.left = selectable.metrics.clientRect.left - bb.left;
          if(Math.abs(selectable.metrics.clientRect.bottom - (bb.bottom + movementY)) < STICK_DISTANCE) prev.bottom = selectable.metrics.clientRect.bottom - bb.bottom;
          if(Math.abs(selectable.metrics.clientRect.right - (bb.right + movementX)) < STICK_DISTANCE) prev.right = selectable.metrics.clientRect.right - bb.right;

          if(Math.abs(selectable.metrics.clientRect.bottom - (bb.top + movementY)) < STICK_DISTANCE) prev.top = selectable.metrics.clientRect.bottom - bb.top;
          if(Math.abs(selectable.metrics.clientRect.right - (bb.left + movementX)) < STICK_DISTANCE) prev.left = selectable.metrics.clientRect.right - bb.left;
          if(Math.abs(selectable.metrics.clientRect.top - (bb.bottom + movementY)) < STICK_DISTANCE) prev.bottom = selectable.metrics.clientRect.top - bb.bottom;
          if(Math.abs(selectable.metrics.clientRect.left - (bb.right + movementX)) < STICK_DISTANCE) prev.right = selectable.metrics.clientRect.left - bb.right;
          return prev;
        }, EMPTY_BOX());

    const stickyMovementX = (sticky.left === null ? (sticky.right == null ? movementX : sticky.right) : sticky.left);
    const stickyMovementY = (sticky.top === null ? (sticky.bottom == null ? movementY : sticky.bottom) : sticky.top);

    // update elements postition
    this.selection = this.selection
    .map(selectable => this.move(selectable, false, stickyMovementX, stickyMovementY));

    // update the destination of each element
    this.selection = this.selection
    .map(selectable => {
      let dropZones = domMetrics.findDropZonesUnderMouse(this.stageDocument, this.store, this.hooks, mouseData.mouseX, mouseData.mouseY)
      .filter(dropZone => this.hooks.canDrop(selectable.el, dropZone));
      if(dropZones.length > 0) {
        switch(selectable.metrics.position) {
          case 'static':
            let nearestPosition = this.findNearestPosition(dropZones, mouseData.mouseX, mouseData.mouseY);
            return this.updateDestinationNonAbsolute(selectable, nearestPosition);
          default:
            let dropZoneUnderMouse = dropZones[0]; // the first one is supposed to be the top most one
            return this.updateDestinationAbsolute(selectable, dropZoneUnderMouse);
        }
      }
      else return selectable;
    });

    // handle the children which move with the selection
    const children = this.store.getState().selectables
    .filter(s => domMetrics.hasASelectedDraggableParent(this.store, s.el))
    .map(selectable => this.move(selectable, true, movementX, movementY));

    // update store
    this.store.dispatch(selectableState.updateSelectables(this.selection.concat(children)));
    this.store.dispatch(setSticky({
      top: sticky.top !== null,
      left: sticky.left !== null,
      bottom: sticky.bottom !== null,
      right: sticky.right !== null,
    }));

    // update scroll
    const initialScroll = this.store.getState().mouse.scrollData;
    const scroll = domMetrics.getScrollToShow(this.stageDocument, {
      top: bb.top + movementY,
      left: bb.left + movementX,
      bottom: bb.bottom + movementY,
      right: bb.right + movementX,
      width: bb.width,
      height: bb.height,
    });
    if(scroll.x !== initialScroll.x || scroll.y !== initialScroll.y) {
      this.debounceScroll(scroll);
    }

    // notify the app
    if(this.hooks.onDrag) this.hooks.onDrag(this.selection, bb);
  }


  /**
   * Called by the Stage class when mouse button is released
   */
  release() {
    super.release();

    this.initialMouse = null;

    this.selection = this.selection.map((selectable) => {
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
          if(selectable.dropZone.parent !== selectable.el.parentElement || selectable.el.nextElementSibling) {
            selectable.el.parentNode.removeChild(selectable.el);
            selectable.dropZone.parent.appendChild(selectable.el);
          }
        }
      }

      let metrics = selectable.metrics;
      if(selectable.metrics.position !== 'static') {
        // check the actual position of the target
        // and move it to match the provided absolute position
        // store initial data
        const initialTop = selectable.el.style.top;
        const initialLeft = selectable.el.style.left;
        const initialTransform = selectable.el.style.transform;
        const initialPosition = selectable.el.style.position;

        // move to the final position will take the new parent offset
        selectable.el.style.top = selectable.metrics.computedStyleRect.top + 'px';
        selectable.el.style.left = selectable.metrics.computedStyleRect.left + 'px';
        selectable.el.style.transform = '';
        selectable.el.style.position = '';

        // check for the offset and update the metrics
        const bb = domMetrics.getBoundingBoxDocument(selectable.el);
        const computedStyleRect = {
          top: selectable.metrics.computedStyleRect.top + (selectable.metrics.clientRect.top - bb.top),
          left: selectable.metrics.computedStyleRect.left + (selectable.metrics.clientRect.left - bb.left),
          right: 0,
          bottom: 0,
        };

        // restore the initial data
        selectable.el.style.top = initialTop;
        selectable.el.style.left = initialLeft;
        selectable.el.style.transform = initialTransform;
        selectable.el.style.position = initialPosition;

        // update bottom and right
        computedStyleRect.right = computedStyleRect.left + selectable.metrics.computedStyleRect.width;
        computedStyleRect.bottom = computedStyleRect.top + selectable.metrics.computedStyleRect.height;

        // update the store
        metrics = {
          ...selectable.metrics,
          computedStyleRect: {
            ...selectable.metrics.computedStyleRect,
            ...computedStyleRect,
          },
        }
      }

      // update the store with the corrected styles
      return {
        ...selectable,
        preventMetrics: false,
        translation: null,
        metrics,
      };
    });

    // remove the position marker
    if(this.positionMarker.parentNode) this.positionMarker.parentNode.removeChild(this.positionMarker);

    // update store
    this.store.dispatch(selectableState.updateSelectables(this.selection), () => {
      // change UI state while selectables metrics are simply updated
      this.store.dispatch(setRefreshing(true));

      // update to real metrics after drop
      const state = this.store.getState().selectables.map(selectable => {
        return {
          ...selectable,
          metrics: domMetrics.getMetrics(selectable.el),
        }
      });
      this.store.dispatch(selectableState.updateSelectables(state));

      this.store.dispatch(setRefreshing(false));

      // notify the app
      if(this.hooks.onDrop) this.hooks.onDrop(this.selection);
    });
  }


  /**
   * move an element and update its data in selection
   * when elements are in a container which is moved, the clientRect changes but not the computedStyleRect
   */
  move(selectable: SelectableState, onlyClientRect: boolean, movementX, movementY): SelectableState {
    return {
      ...selectable,
      translation: selectable.translation ? {
        x: selectable.translation.x + movementX,
        y: selectable.translation.y + movementY,
      } : null,
      metrics: {
        ...selectable.metrics,
        clientRect : {
          ...selectable.metrics.clientRect,
          top: selectable.metrics.clientRect.top + movementY,
          left: selectable.metrics.clientRect.left + movementX,
          bottom: selectable.metrics.clientRect.bottom + movementY,
          right: selectable.metrics.clientRect.right + movementX,
        },
        computedStyleRect: onlyClientRect ? selectable.metrics.computedStyleRect : {
          ...selectable.metrics.computedStyleRect,
          top: selectable.metrics.computedStyleRect.top + movementY,
          left: selectable.metrics.computedStyleRect.left + movementX,
          bottom: selectable.metrics.computedStyleRect.bottom + movementY,
          right: selectable.metrics.computedStyleRect.right + movementX,
        },
      }
    };
  }


  /**
   * update the destination of the absolutely positioned elements
   */
  updateDestinationAbsolute(selectable: SelectableState, dropZoneUnderMouse: HTMLElement): SelectableState {
    if(dropZoneUnderMouse === null) {
      // FIXME: should fallback on the body?
      console.info('no dropZone under the mouse found, how is it poussible!');
      return selectable;
    }
    else {
      return {
        ...selectable,
        dropZone: {
          ...selectable.dropZone,
          parent: dropZoneUnderMouse,
        },
      };
    }
  }


  /**
   * update the destination of the NOT absolutely positioned elements
   * and display a marker in the flow
   */
  updateDestinationNonAbsolute(selectable: SelectableState, nearestPosition): SelectableState {
    if(nearestPosition.distance === null) {
      // FIXME: should fallback on the body?
      console.info('no nearest position found, how is it poussible?');
      return selectable;
    }
    else {
      this.markPosition(nearestPosition);
      return {
        ...selectable,
        dropZone: nearestPosition,
      };
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
    let bbMarker: ClientRect = domMetrics.getBoundingBoxDocument(this.positionMarker);
    let bbTargetPrev: ClientRect = this.positionMarker.previousElementSibling ? domMetrics.getBoundingBoxDocument(this.positionMarker.previousElementSibling as HTMLElement) : null;
    let bbTargetNext: ClientRect = this.positionMarker.nextElementSibling ? domMetrics.getBoundingBoxDocument(this.positionMarker.nextElementSibling as HTMLElement) : null;
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
   * place an empty div (phantom) at each possible place in the dom
   * find the place where it is the nearest from the mouse
   * x and y are coordinates relative to the viewport
   */
  findNearestPosition(dropZones: Array<HTMLElement>, x, y) {
    // create an empty div to measure distance to the mouse
    let phantom = this.stageDocument.createElement('div');
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
        let sibling = dropZone.childNodes[idx] as HTMLElement;
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

  /**
   * get the distance from el's center to (x, y)
   * x and y are relative to the viewport
   */
  getDistance(el: HTMLElement, x: number, y: number) {
    const bb = el.getBoundingClientRect();
    const center = {
      x: bb.left + (bb.width/2),
      y: bb.top + (bb.height/2),
    }
    return Math.sqrt(((center.x - x) * (center.x - x)) + ((center.y - y) * (center.y - y)));
  }
}
