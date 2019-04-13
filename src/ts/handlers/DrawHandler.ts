import { StageStore } from '../flux/StageStore';
import { Hooks, MouseData, SelectableState } from '../Types';
import { MouseHandlerBase } from './MouseHandlerBase';
import * as selectionState from '../flux/SelectionState';
import * as mouseState from '../flux/MouseState';
import * as domMetrics from '../utils/DomMetrics';

export class DrawHandler extends MouseHandlerBase {
  initialX: number;
  initialY: number;
  regionMarker: HTMLElement;

  constructor(doc: HTMLDocument, store: StageStore, hooks: Hooks) {
    super(doc, store, hooks);

    const state = store.getState();

    this.initialX = state.mouse.mouseData.mouseX;
    this.initialY = state.mouse.mouseData.mouseY;

    // create and attach a div to draw the region
    // FIXME: the region marker should be outside the iframe
    this.regionMarker = doc.createElement('div');
    this.regionMarker.classList.add('region-marker');
    this.moveRegion({left: -999, top: -999, right: -999, bottom: -999});
    doc.body.appendChild(this.regionMarker);
  }

  update(mouseData: MouseData) {
    super.update(mouseData);

    const bb = {
      left: Math.min(this.initialX, mouseData.mouseX),
      top: Math.min(this.initialY, mouseData.mouseY),
      right: Math.max(this.initialX, mouseData.mouseX),
      bottom: Math.max(this.initialY, mouseData.mouseY),
    };

    // update scroll
    const initialScroll = this.store.getState().mouse.scrollData;
    const scroll = domMetrics.getScrollToShow(this.doc, bb);
    if(scroll.x !== initialScroll.x || scroll.y !== initialScroll.y) {
      this.store.dispatch(mouseState.setScroll(scroll));
    }

    console.info('todo: handle scroll on the side of the iframe');
    // handle scroll on the side of the iframe
    // if(this.handler) {
    //   const bb = this.handler.getBoundingBox();
    //   if(bb) {
    //     const update = domMetrics.getScrollToShow(this.contentDocument, bb);
    //     const updatingScroll = update.x != 0 || update.y != 0;
    //     console.log('bb', bb, update);
    //     // this.handler.update(movementX + update.x, movementY + update.y, clientX + update.x, clientY + update.y, shiftKey);
    //     // if(updatingScroll) setTimeout(_ => this.updateScroll(0, 0, clientX, clientY, shiftKey), 100);
    //     if(updatingScroll) {
    //       setTimeout(_ => updatingScroll = false, 10);
    //     }
    //   }
    // }

    // update the drawing
    this.moveRegion(bb);

    // select all elements which intersect with the region
    let newSelection = this.store.getState().selectables
    .filter(selectable => {
      return selectable.metrics.clientRect.left < Math.max(this.initialX, mouseData.mouseX) &&
      selectable.metrics.clientRect.right > Math.min(this.initialX, mouseData.mouseX) &&
      selectable.metrics.clientRect.top < Math.max(this.initialY, mouseData.mouseY) &&
      selectable.metrics.clientRect.bottom > Math.min(this.initialY, mouseData.mouseY);
    });
    // handle removed elements
    this.selection
    .filter(selectable => !newSelection.find(s => selectable.el === s.el))
    .forEach(selectable => {
      this.store.dispatch(selectionState.remove(selectable));
    });
    // handle added elements
    newSelection
    .filter(selectable => !this.selection.find(s => selectable.el === s.el))
    .forEach(selectable => {
      this.store.dispatch(selectionState.add(selectable));
    });
    // store the new selection
    this.selection = newSelection;
  }


  release() {
    super.release();
    this.regionMarker.parentNode.removeChild(this.regionMarker);
    this.selection = [];
  }

  /**
   * display the position marker atthe given positionin the dom
   */
  moveRegion({left, top, right, bottom}) {
    const scroll = domMetrics.getScroll(this.doc);
    this.regionMarker.style.width = (right - left) + 'px';
    this.regionMarker.style.height = (bottom - top) + 'px';
    this.regionMarker.style.transform = `translate(${left+scroll.x}px, ${top+scroll.y}px)`; // scale(${width}, ${height})
  }
}
