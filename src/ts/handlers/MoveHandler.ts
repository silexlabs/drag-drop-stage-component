import {MouseHandlerBase} from './MouseHandlerBase';
import { StageStore } from '../flux/StageStore';
import { Hooks, SelectableState, MouseData, DropZone, ScrollData, State } from '../Types';
import * as selectableState from '../flux/SelectableState'
import * as mouseState from '../flux/MouseState';
import * as domMetrics from '../utils/DomMetrics';

export class MoveHandler extends MouseHandlerBase {
  private positionMarker: HTMLElement;
  private unsubsribeScroll: () => void;

  constructor(doc: HTMLDocument, store: StageStore, hooks: Hooks) {
    super(doc, store, hooks);

    // keep only draggable elements
    // which are not in a selected element also being dragged
    this.selection = this.selection
    .filter(s => s.draggable)
    .filter(s => !domMetrics.hasASelectedDraggableParent(store, s.el));

    // FIXME: the region marker should be outside the iframe
    this.positionMarker = this.doc.createElement('div');
    this.positionMarker.classList.add('position-marker');

    // add css class and style
    this.selection.forEach(selectable => {
      selectable.el.classList.add('dragging');
    });

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

    // listen for scroll
    this.unsubsribeScroll = this.store.subscribe(
      (cur: ScrollData, prev: ScrollData) => this.onScroll(cur, prev),
      (state: State): ScrollData => state.mouse.scrollData
    );
  }

  onScroll(state: ScrollData, prev: ScrollData) {
    console.log('onScroll', state.y);
    // move the dragged elements back
    this.store.dispatch(selectableState.updateSelectables(
      this.selection.map(s => this.move(s, -(state.x - prev.x), -(state.y - prev.y)))
    ))
  }


  /**
   * Called by the Stage class when mouse moves
   */
  update(mouseData: MouseData) {
    super.update(mouseData);

    const bb = domMetrics.getBoundingBox(this.selection);
    const initialScroll = this.store.getState().mouse.scrollData;
    const scroll = domMetrics.getScrollToShow(this.doc, bb);
    if(scroll.x !== initialScroll.x || scroll.y !== initialScroll.y) {
      // avoid "Maximum call stack size exceeded" error
      // and scrolls too fast
      setTimeout(() => {
        this.store.dispatch(mouseState.setScroll(scroll));
      }, 100);
    }

    // remove the marker
    if(this.positionMarker.parentNode) this.positionMarker.parentNode.removeChild(this.positionMarker);

    // update elements postition
    this.selection = this.selection
    .map(selectable => this.move(selectable, mouseData.movementX, mouseData.movementY));

    // update the destination of each element
    this.selection = this.selection
    .map(selectable => {
      let dropZones = this.findDropZonesUnderMouse(mouseData.mouseX, mouseData.mouseY);
      switch(selectable.metrics.position) {
        case 'static':
          let nearestPosition = this.findNearestPosition(dropZones, mouseData.mouseX, mouseData.mouseY);
          return this.updateDestinationNonAbsolute(selectable, nearestPosition);
        default:
          let dropZoneUnderMouse = dropZones[0]; // the first one is supposed to be the top most one
          return this.updateDestinationAbsolute(selectable, dropZoneUnderMouse);
      }
    });

    // update store
    this.store.dispatch(selectableState.updateSelectables(this.selection));
  }


  /**
   * Called by the Stage class when mouse button is released
   */
  release() {
    super.release();
    this.unsubsribeScroll();
    this.selection = this.selection.map((selectable) => {
      // reset css class and style
      selectable.el.classList.remove('dragging');

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
      // update to real metrics after drop
      const state = this.store.getState().selectables.map(selectable => {
        return {
          ...selectable,
          metrics: domMetrics.getMetrics(selectable.el),
        }
      });
      this.store.dispatch(selectableState.updateSelectables(state));
    });
  }


  /**
   * move an element and update its data in selection
   */
  move(selectable: SelectableState, movementX, movementY): SelectableState {
    // update the store
    return {
      ...selectable,
      translation: {
        x: selectable.translation.x + movementX,
        y: selectable.translation.y + movementY,
      },
      metrics: {
        ...selectable.metrics,
        clientRect: {
          ...selectable.metrics.clientRect,
          top: selectable.metrics.clientRect.top + movementY,
          left: selectable.metrics.clientRect.left + movementX,
          bottom: selectable.metrics.clientRect.bottom + movementY,
          right: selectable.metrics.clientRect.right + movementX,
        },
        computedStyleRect: {
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
   * find the dropZone elements which are under the mouse
   * the first one in the list is supposed to be the top most one
   * x and y are relative to the viewport, not the document
   */
  findDropZonesUnderMouse(x, y): Array<HTMLElement> {
    const win = domMetrics.getWindow(this.doc);
    if(x > win.innerWidth || y > win.innerHeight || x < 0 || y < 0) {
      throw new Error(`Coords out of viewport, can not get the drop zone at coordinates (${x}, ${y}) while the viewport is (${win.innerWidth}, ${win.innerHeight})`);
    }

    // get a list of all dropZone zone under the point (x, y)
    return this.doc.elementsFromPoint(x, y)
    .filter((el: HTMLElement) => {
      const selectable = this.store.getState().selectables.find(s => s.el === el);
      return (!selectable || selectable.isDropZone)
        && (!!selectable || this.hooks.isDropZone(el))
        && (!selectable || !this.selection.find(s => s.el === el))
        && this.hooks.canDrop(el, this.selection);
    }) as Array<HTMLElement>;
  }

  /**
   * place an empty div (phantom) at each possible place in the dom
   * find the place where it is the nearest from the mouse
   */
  findNearestPosition(dropZones: Array<HTMLElement>, x, y) {
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
   * x and y are relative to the document, not the viewport
   */
  getDistance(el: HTMLElement, x: number, y: number) {
    const bb = domMetrics.getBoundingBoxDocument(el);
    const center = {
      x: bb.left + (bb.width/2),
      y: bb.top + (bb.height/2),
    }
    return Math.sqrt(((center.x - x) * (center.x - x)) + ((center.y - y) * (center.y - y)));
  }
}
