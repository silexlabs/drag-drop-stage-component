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
    this.selection.forEach((selectable: SelectableState) => {
      // handle the width and height computation
      const clientRect = {
        ...selectable.metrics.clientRect,
      };
      const computedStyleRect = {
        ...selectable.metrics.computedStyleRect,
      };
      const cursorData = this.store.getState().mouse.cursorData;
      const heightAttr = selectable.useMinHeight ? 'minHeight' : 'height';
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
        console.log('TODO: handle the case when the content is too big');
        // handle the case where the content is too big
        // const bb = selectable.el.getBoundingClientRect();
        // const delta = bb.height - computedStyleRect.height;
        // console.log('delta', delta)
        // selectable.el.style.top = DomMetrics.getStyleValue(selectable.el, this.doc, 'top', {
        //   computedStyleRect: computedStyleRect,
        //   delta: Object.assign({}, selectable.delta, {top: selectable.delta.top - delta})
        // });
      }

      // update the metrics
      selectable.metrics = {
        ...selectable.metrics,
        clientRect,
        computedStyleRect,
      }
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
  }
}
