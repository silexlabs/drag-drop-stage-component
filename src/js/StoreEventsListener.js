import {MoveHandler} from './handlers/MoveHandler';
import {DrawHandler} from './handlers/DrawHandler';
import { ResizeHandler } from './handlers/ResizeHandler';

const CURSOR_DEFAULT = 'default';
const CURSOR_NW = 'nw-resize';
const CURSOR_NE = 'ne-resize';
const CURSOR_SW = 'sw-resize';
const CURSOR_SE = 'se-resize';
const CURSOR_W = 'w-resize';
const CURSOR_E = 'e-resize';
const CURSOR_N = 'n-resize';
const CURSOR_S = 's-resize';

export class StoreEventsListener {
  constructor(store) {
    this.store = store;
    this.store.subscribe(() => this.onStateChanged(this.store.getState()))
  }
  /**
   * handle state changes, detect changes of scroll or metrics or selection
   * @param {State} state
   */
  onStateChanged(state) {
    // check scroll
    if(this.oldState.scroll !== state.scroll) {
      this.onScrollState(state.scroll);
    }
    if(this.oldState.ui !== state.ui) {
      this.onUiState(this.oldState.ui, state.ui);
    }
    if(this.oldState.selectables !== this.state.selectables) {
      this.state.selectables
      .forEach(selectable => {
        const old = this.oldState.selectables.find(oldSelectable => selectable === oldSelectable);
        // check metrics
        if(oldSelectable.metrics !== selectable.metrics) this.onMetricsState(selectable);
        // check selection
        if(oldSelectable.selected !== selectable.selected) this.onSelectionState(selectable);
      });
    }
    this.oldState = state;
  }
  onScrollState(scroll) {
    console.log('onScrollState')
  }
  onUiState(oldUi, newUi) {
    console.log('onUiState')
    // ResizeHandler.getCursorClass(newUi.cursorDirection)

    // this.handler = new ResizeHandler(this.getSelection()
    // .filter(el => this.isResizeableHook(el)),
    // this.doc,
    // {
    //   useMinHeightHook: el => true,
    //   direction,
    // });

    // this.handler = new MoveHandler(this.getSelection()
    // .filter(el => !this.hasASelectedDraggableParent(el) && this.isDraggableHook(el)),
    // this.doc,
    // this.isDroppableHook);

    // this.selection.set([]);
    // this.handler = new DrawHandler(clientX, clientY, this.doc, this.isSelectableHook);
    // this.handler.on('unSelect', e => this.unSelect(e.target, true));
    // this.handler.on('select', e => this.select(e.target, true));

  }
  onMetricsState(selectable) {
    console.log('onMetricsState')
    // update scroll
    const scroll = DomMetrics.getScrollToShow(this.doc, );
    // this.store.dispatch(ScrollAction.set({movementX, movementY, clientX, clientY, shiftKey}));
    // updateScroll(movementX, movementY, clientX, clientY, shiftKey) {
    // handle scroll on the side of the iframe
    if(this.handler) {
      const bb = this.handler.getBoundingBox();
      if(bb) {
        const update = DomMetrics.getScrollToShow(this.contentDocument, bb);
        const updatingScroll = update.x != 0 || update.y != 0;
        console.log('bb', bb, update);
        // this.handler.update(movementX + update.x, movementY + update.y, clientX + update.x, clientY + update.y, shiftKey);
        // if(updatingScroll) setTimeout(_ => this.updateScroll(0, 0, clientX, clientY, shiftKey), 100);
        if(updatingScroll) {
          setTimeout(_ => updatingScroll = false, 10);
        }
      }
    }
  }
  onSelectionState(selectable) {
    console.log('onSelectionState')
  }
}