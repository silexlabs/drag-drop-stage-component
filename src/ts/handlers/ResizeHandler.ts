import {MouseHandlerBase} from './MouseHandlerBase';
import { StageStore } from '../flux/StageStore';
import { Hooks, SelectableState, MouseData } from '../Types';
import * as selectableState from '../flux/SelectableState'
import * as mouseState from '../flux/MouseState';
import * as domMetrics from '../utils/DomMetrics';

export class ResizeHandler extends MouseHandlerBase {
  constructor(doc: HTMLDocument, store: StageStore, hooks: Hooks) {
    super(doc, store, hooks);

    // keep only risizeable elements
    this.selection = this.selection.filter(s => s.resizeable);

    // add css class
    this.selection.forEach(selectable => selectable.el.classList.add('resizing'));
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
      this.store.dispatch(mouseState.setScroll(scroll));
    }

    console.info('todo: handle scroll on the side of the iframe');

    // handle scroll on the side of the iframe
    // if(this.handler) {
    //   const bb = this.handler.getBoundingBox();
    //   if(bb) {
    //     const update = DomMetrics.getScrollToShow(this.contentDocument, bb);
    //     const updatingScroll = update.x != 0 || update.y != 0;
    //     console.log('bb', bb, update);
    //     // this.handler.update(mouseData.movementX + update.x, mouseData.movementY + update.y, clientX + update.x, clientY + update.y, shiftKey);
    //     // if(updatingScroll) setTimeout(_ => this.updateScroll(0, 0, clientX, clientY, shiftKey), 100);
    //     if(updatingScroll) {
    //       setTimeout(_ => updatingScroll = false, 10);
    //     }
    //   }
    // }

    // set a new size
    this.selection = this.selection.map((selectable: SelectableState) => {
      // handle the width and height computation
      const clientRect = {
        ...selectable.metrics.clientRect,
      };
      const computedStyleRect = {
        ...selectable.metrics.computedStyleRect,
      };
      const cursorData = this.store.getState().mouse.cursorData;
      switch(cursorData.x) {
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
        default: throw new Error('unknown direction ' + cursorData.x);
      }
      if(cursorData.y != '') {
        if(mouseData.shiftKey && cursorData.x != '') {
          computedStyleRect.height = computedStyleRect.width * selectable.metrics.proportions;
          clientRect.height = clientRect.width * selectable.metrics.proportions;
        }
        else {
          if(cursorData.y === 'top') {
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
      if(cursorData.x === 'left') {
        // compute the change
        computedStyleRect.left += mouseData.movementX;
        clientRect.left += mouseData.movementX;
      }
      if(cursorData.y === 'top') {
        // compute the change
        computedStyleRect.top += mouseData.movementY;
        clientRect.top += mouseData.movementY;
      }
      // handle the case where the resize has not been possible
      // either because the content is too big, or a min-whidth/height has overriden our changes
      if(cursorData.x !== '') {
        //  store initial data
        const initialWidth = selectable.el.style.width;

        // move to the final position will take the new parent offset
        selectable.el.style.width = computedStyleRect.width + 'px';

        // check for the offset and update the metrics
        const bb = selectable.el.getBoundingClientRect();
        const delta = clientRect.width - bb.width;
        computedStyleRect.width -= delta;
        clientRect.width -= delta;
        if(cursorData.x === 'left') {
          computedStyleRect.left += delta;
          clientRect.left += delta;
        }
        // restore the initial data
        selectable.el.style.width = initialWidth;
      }
      // handle the case where the resize has not been possible
      // either because the content is too big, or a min-whidth/height has overriden our changes
      if(cursorData.y !== '') {
        //  store initial data
        const heightAttr = selectable.useMinHeight ? 'minHeight' : 'height';
        const initialHeight = selectable.el.style[heightAttr];

        // move to the final position will take the new parent offset
        selectable.el.style[heightAttr] = computedStyleRect.height + 'px';

        // check for the offset and update the metrics
        const bb = selectable.el.getBoundingClientRect();
        const delta = clientRect.height - bb.height;
        computedStyleRect.height -= delta;
        clientRect.height -= delta;
        if(cursorData.y === 'top') {
          computedStyleRect.top += delta;
          clientRect.top += delta;
        }

        // restore the initial data
        selectable.el.style[heightAttr] = initialHeight;
      }

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
  }


  /**
   * Called by the Stage class when mouse button is released
   */
  release() {
    super.release();
    this.selection.forEach(selectable => selectable.el.classList.remove('resizing'));
    // reset the state of the mouse
    // this is useful when the resize has not been taken into account (e.g. content too big)
    // and the mouse is not on the edge of the element anymore
    const state = this.store.getState();
    const selectable = domMetrics.getSelectable(this.store, state.mouse.mouseData.target);
    this.store.dispatch(mouseState.setCursorData(domMetrics.getCursorData(state.mouse.mouseData.mouseX, state.mouse.mouseData.mouseY, state.mouse.scrollData, selectable)));

    // update the real metrics after drop
    const updatedState = this.store.getState().selectables.map(selectable => {
      return {
        ...selectable,
        metrics: domMetrics.getMetrics(selectable.el),
      }
    });
    this.store.dispatch(selectableState.updateSelectables(updatedState));
  }
}
