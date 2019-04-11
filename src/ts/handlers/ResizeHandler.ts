import {MouseHandlerBase} from './MouseHandlerBase';
import { StageStore } from '../flux/StageStore';
import { Hooks, SelectableState, MouseData } from '../Types';

export class ResizeHandler extends MouseHandlerBase {
  private selection: Array<SelectableState>;
  constructor(doc: HTMLDocument, store: StageStore, hooks: Hooks) {
    super(doc, store, hooks);

    // store selection
    this.selection = store.getState().selectables.filter(s => s.selected && s.draggable);

    // add css class
    this.selection.forEach(selectable => selectable.el.classList.add('resizing'));
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

    // this.selection.forEach((selectable: SelectableState) => {
    //   // handle the width and height computation
    //   const heightAttr = this.useMinHeightHook(selectable.target) ? 'minHeight' : 'height';
    //   switch(this.direction.x) {
    //     case '':
    //       break;
    //     case 'left':
    //       selectable.computedStyle.width -= movementX;
    //       break;
    //     case 'right':
    //       selectable.computedStyle.width += movementX;
    //       break;
    //     default: throw new Error('unknown direction ' + this.direction.x);
    //   }
    //   if(this.direction.y != '') {
    //     if(shiftKey && this.direction.x != '' && this.direction.y != '') {
    //       selectable.computedStyle.height = selectable.computedStyle.width * selectable.initialRatio;
    //     }
    //     else {
    //       if(this.direction.y === 'top') {
    //         selectable.computedStyle.height -= movementY;
    //       }
    //       else {
    //         selectable.computedStyle.height += movementY;
    //       }
    //     }
    //   }
    //   // apply the with and height
    //   selectable.target.style.width = DomMetrics.getStyleValue(selectable.target, this.doc, 'width', selectable) ;
    //   selectable.target.style[heightAttr] = DomMetrics.getStyleValue(selectable.target, this.doc, 'height', selectable);

    //   // handle the position change
    //   if(this.direction.x === 'left') {
    //     // compute the change
    //     selectable.computedStyle.left += movementX;
    //     // apply the position
    //     selectable.target.style.left = DomMetrics.getStyleValue(selectable.target, this.doc, 'left', selectable);
    //   }
    //   if(this.direction.y === 'top') {
    //     // correction when the content is too big
    //     const bb = selectable.target.getBoundingClientRect();
    //     // compute the change
    //     selectable.computedStyle.top += movementY;
    //     // apply the position
    //     // handle the case where the content is too small
    //     const delta = bb.height - selectable.computedStyle.height;
    //     console.log('delta', delta)
    //     selectable.target.style.top = DomMetrics.getStyleValue(selectable.target, this.doc, 'top', {
    //       computedStyle: selectable.computedStyle,
    //       delta: Object.assign({}, selectable.delta, {top: selectable.delta.top - delta})
    //     });
    //   }
    // });
  }


  /**
   * Called by the Stage class when mouse button is released
   */
  release() {
    super.release();
    this.selection.forEach(selectable => selectable.el.classList.remove('resizing'));
  }
}
