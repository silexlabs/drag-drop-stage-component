import {MouseHandlerBase} from './MouseHandlerBase';
import { StageStore } from '../flux/StageStore';
import { Hooks, SelectableState, MouseData, CursorData } from '../Types';
import * as selectableState from '../flux/SelectableState'
import * as mouseState from '../flux/MouseState';
import * as domMetrics from '../utils/DomMetrics';

export class ResizeHandler extends MouseHandlerBase {
  private cursorData: CursorData;
  constructor(stageDocument: HTMLDocument, overlayDocument: HTMLDocument, store: StageStore, hooks: Hooks) {
    super(stageDocument, overlayDocument, store, hooks);

    // direction
    this.cursorData = this.store.getState().mouse.cursorData;

    // keep only risizeable elements
    this.selection = this.selection.filter(s => domMetrics.isResizeable(s.resizeable, this.cursorData));
  }

  /**
   * Called by the Stage class when mouse moves
   */
  update(mouseData: MouseData) {
    super.update(mouseData);

    // console.info('todo: handle scroll on the side of the iframe');

    // set a new size
    this.selection = this.selection.map((selectable: SelectableState) => {
      // handle the width and height computation
      const clientRect = {
        ...selectable.metrics.clientRect,
      };
      const computedStyleRect = {
        ...selectable.metrics.computedStyleRect,
      };
      switch(this.cursorData.x) {
        case '':
          break;
        case 'left':
          computedStyleRect.width -= mouseData.movementX;
          clientRect.width -= mouseData.movementX;
          break;
        case 'right':
          computedStyleRect.width += mouseData.movementX;
          clientRect.width += mouseData.movementX;
          break;
        default: throw new Error('unknown direction ' + this.cursorData.x);
      }
      if(this.cursorData.y != '') {
        if(mouseData.shiftKey && this.cursorData.x != '') {
          computedStyleRect.height = computedStyleRect.width * selectable.metrics.proportions;
          clientRect.height = clientRect.width * selectable.metrics.proportions;
        }
        else {
          if(this.cursorData.y === 'top') {
            computedStyleRect.height -= mouseData.movementY;
            clientRect.height -= mouseData.movementY;
          }
          else {
            computedStyleRect.height += mouseData.movementY;
            clientRect.height += mouseData.movementY;
          }
        }
      }

      // handle the position change
      if(this.cursorData.x === 'left') {
        // compute the change
        computedStyleRect.left += mouseData.movementX;
        clientRect.left += mouseData.movementX;
      }
      if(this.cursorData.y === 'top') {
        // compute the change
        computedStyleRect.top += mouseData.movementY;
        clientRect.top += mouseData.movementY;
      }
      // handle the case where the resize has not been possible
      // either because the content is too big, or a min-whidth/height has overriden our changes
      if(this.cursorData.x !== '') {
        //  store initial data
        const initialWidth = selectable.el.style.width;

        // move to the final position will take the new parent offset
        selectable.el.style.width = computedStyleRect.width + 'px';

        // check for the offset and update the metrics
        const bb = domMetrics.getBoundingBoxDocument(selectable.el);
        const delta = clientRect.width - bb.width;
        computedStyleRect.width -= delta;
        clientRect.width -= delta;
        if(this.cursorData.x === 'left') {
          computedStyleRect.left += delta;
          clientRect.left += delta;
        }
        // restore the initial data
        selectable.el.style.width = initialWidth;
      }
      // handle the case where the resize has not been possible
      // either because the content is too big, or a min-whidth/height has overriden our changes
      if(this.cursorData.y !== '') {
        //  store initial data
        const heightAttr = selectable.useMinHeight ? 'minHeight' : 'height';
        const initialHeight = selectable.el.style[heightAttr];

        // move to the final position will take the new parent offset
        selectable.el.style[heightAttr] = computedStyleRect.height + 'px';

        // check for the offset and update the metrics
        const bb = domMetrics.getBoundingBoxDocument(selectable.el);
        const delta = clientRect.height - bb.height;
        computedStyleRect.height -= delta;
        clientRect.height -= delta;
        if(this.cursorData.y === 'top') {
          computedStyleRect.top += delta;
          clientRect.top += delta;
        }

        // restore the initial data
        selectable.el.style[heightAttr] = initialHeight;
      }

      // update bottom and right
      computedStyleRect.right = computedStyleRect.left + computedStyleRect.width;
      clientRect.right = clientRect.left + clientRect.width;
      computedStyleRect.bottom = computedStyleRect.top + computedStyleRect.height;
      clientRect.bottom = clientRect.top + clientRect.height;

      // update the metrics
      return {
        ...selectable,
        metrics: {
          ...selectable.metrics,
          clientRect,
          computedStyleRect,
        }
      };
    });
    // dispatch all the changes at once
    this.store.dispatch(selectableState.updateSelectables(this.selection));

    // update scroll
    const bb = domMetrics.getBoundingBox(this.selection);
    const initialScroll = this.store.getState().mouse.scrollData;
    const scroll = domMetrics.getScrollToShow(this.stageDocument, bb);
    if(scroll.x !== initialScroll.x || scroll.y !== initialScroll.y) {
      this.debounceScroll(scroll);
    }

    // notify the app
    if(this.hooks.onResize) this.hooks.onResize(this.selection, bb);
  }


  /**
   * Called by the Stage class when mouse button is released
   */
  release() {
    super.release();
    // reset the state of the mouse
    // this is useful when the resize has not been taken into account (e.g. content too big)
    // and the mouse is not on the edge of the element anymore
    const state = this.store.getState();
    const selectable = domMetrics.getSelectable(this.store, state.mouse.mouseData.target);
    this.store.dispatch(mouseState.setCursorData(domMetrics.getCursorData(state.mouse.mouseData.mouseX, state.mouse.mouseData.mouseY, state.mouse.scrollData, selectable)));

    // update the real metrics after drop
    setTimeout(() => {
      const updatedState = this.store.getState().selectables
      .map(selectable => {
        return {
          ...selectable,
          metrics: domMetrics.getMetrics(selectable.el),
        }
      });
      this.store.dispatch(selectableState.updateSelectables(updatedState));

      // notify the app
      if(this.hooks.onResizeEnd) this.hooks.onResizeEnd(this.selection);
    }, 0)
  }
}
