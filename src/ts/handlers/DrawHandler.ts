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

  constructor(stageDocument: HTMLDocument, overlayDocument: HTMLDocument, store: StageStore, hooks: Hooks) {
    super(stageDocument, overlayDocument, store, hooks);

    const state = store.getState();

    const scrollData = domMetrics.getScroll(this.stageDocument);
    this.initialX = state.mouse.mouseData.mouseX + scrollData.x;
    this.initialY = state.mouse.mouseData.mouseY + scrollData.y;

    // create and attach a div to draw the region
    // FIXME: the region marker should be outside the iframe
    this.regionMarker = overlayDocument.createElement('div');
    this.regionMarker.classList.add('region-marker');
    this.moveRegion({left: -999, top: -999, right: -999, bottom: -999, width: 0, height: 0});
    overlayDocument.body.appendChild(this.regionMarker);
  }

  update(mouseData: MouseData) {
    super.update(mouseData);

    const scrollData = domMetrics.getScroll(this.stageDocument);
    const bb = {
      left: Math.min(this.initialX, (mouseData.mouseX + scrollData.x)),
      top: Math.min(this.initialY, (mouseData.mouseY + scrollData.y)),
      right: Math.max(this.initialX, (mouseData.mouseX + scrollData.x)),
      bottom: Math.max(this.initialY, (mouseData.mouseY + scrollData.y)),
      height: Math.abs(this.initialY - (mouseData.mouseY + scrollData.y)),
      width: Math.abs(this.initialX - (mouseData.mouseX + scrollData.x)),
    };

    // update the drawing
    this.moveRegion(bb);

    // select all elements which intersect with the region
    let newSelection = this.store.getState().selectables
    .filter(selectable => {
      return selectable.selectable &&
        selectable.metrics.clientRect.left < bb.right &&
        selectable.metrics.clientRect.right > bb.left &&
        selectable.metrics.clientRect.top < bb.bottom &&
        selectable.metrics.clientRect.bottom > bb.top;
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

    // update scroll
    const initialScroll = this.store.getState().mouse.scrollData;
    const scroll = domMetrics.getScrollToShow(this.stageDocument, bb);
    if(scroll.x !== initialScroll.x || scroll.y !== initialScroll.y) {
      this.debounceScroll(scroll);
    }

    // notify the app
    if(this.hooks.onDraw) this.hooks.onDraw(this.selection, bb);
  }


  release() {
    super.release();
    this.regionMarker.parentNode.removeChild(this.regionMarker);

    // notify the app
    if(this.hooks.onDrawEnd) this.hooks.onDrawEnd(this.selection);

    this.selection = [];
  }

  /**
   * display the position marker atthe given positionin the dom
   */
  moveRegion({left, top, width, height}: ClientRect) {
    this.regionMarker.style.width = width + 'px';
    this.regionMarker.style.height = height + 'px';
    this.regionMarker.style.transform = `translate(${left}px, ${top}px)`; // scale(${width}, ${height})
  }
}
