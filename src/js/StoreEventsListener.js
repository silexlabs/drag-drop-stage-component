import * as DomMetrics from './utils/DomMetrics';
import * as Ui from './store/Ui';
import {ResizeHandler} from './handlers/ResizeHandler';
import {DrawHandler} from './handlers/DrawHandler';
import {MoveHandler} from './handlers/MoveHandler';

const CURSOR_DEFAULT = 'default';
const CURSOR_POINTER = 'pointer';
const CURSOR_NW = 'nw-resize';
const CURSOR_NE = 'ne-resize';
const CURSOR_SW = 'sw-resize';
const CURSOR_SE = 'se-resize';
const CURSOR_W = 'w-resize';
const CURSOR_E = 'e-resize';
const CURSOR_N = 'n-resize';
const CURSOR_S = 's-resize';

/**
 * @class This class listens to the store
 *   and apply the state changes to the DOM elements
 */
export class StoreEventsListener {
  constructor(doc, store) {
    this.doc = doc;
    this.store = store;
    this.oldState = this.getOldState(this.store.getState());
    this.store.subscribe(() => this.onStateChanged(this.store.getState()))
    this.handler = null;
  }
  // this method returns a new object with references to the substates
  // usefull to compare and know what has changed
  getOldState(state) {
    return {
      scroll: state.scroll,
      selectables: state.selectables,
      ui: state.ui,
    };
  }
  getCursorClass(direction) {
    if(!direction) return CURSOR_DEFAULT;
    if(direction.x === '' && direction.y === '') return CURSOR_POINTER;
    else if(direction.x === 'left' && direction.y === 'top') return CURSOR_NW;
    else if(direction.x === 'right' && direction.y === 'top') return CURSOR_NE;
    else if(direction.x === 'left' && direction.y === 'bottom') return CURSOR_SW;
    else if(direction.x === 'right' && direction.y === 'bottom') return CURSOR_SE;
    else if(direction.x === 'left' && direction.y === '') return CURSOR_W;
    else if(direction.x === 'right' && direction.y === '') return CURSOR_E;
    else if(direction.x === '' && direction.y === 'top') return CURSOR_N;
    else if(direction.x === '' && direction.y === 'bottom') return CURSOR_S;
    throw new Error('direction not found');
  }
  /**
   * handle state changes, detect changes of scroll or metrics or selection
   * @param {State} state
   */
  onStateChanged(state) {
    // check scroll
    if(this.oldState.scroll !== state.scroll) {
      this.onScroll(state.scroll);
    }
    // check Ui
    if(this.oldState.ui !== state.ui) {
      this.onUi(this.oldState.ui, state.ui);
    }
    // select selectables which have changed
    const filterBy = (propName, selectable) => {
      const oldSelectable = this.oldState.selectables.find(old => selectable === old);
      // FIXME: use JSON.stringify to compare?
      return !oldSelectable || oldSelectable[propName] !== selectable[propName];
    }
    if(this.oldState.selectables !== state.selectables) {
      this.onMetrics(state.selectables
        .filter(selectable => filterBy('metrics', selectable)));
      this.onSelection(state.selectables
        .filter(selectable => filterBy('selected', selectable)));
      this.onDraggable(state.selectables
        .filter(selectable => filterBy('draggable', selectable)));
      this.onResizeable(state.selectables
        .filter(selectable => filterBy('resizeable', selectable)));
      this.onDroppable(state.selectables
        .filter(selectable => filterBy('droppable', selectable)));
    }
    this.oldState = this.getOldState(state);
  }
  onScroll(scroll) {
    console.log('onScroll', scroll);
    const oldScroll = DomMetrics.getScroll(this.doc);
    if(scroll.x !== oldScroll.x || scroll.y !== oldScroll.y) {
      DomMetrics.setScroll(this.doc, scroll);
    }
  }
  onUi(old, ui) {
    console.log('onUi', ui.mouseHandlerData);
    this.doc.body.style.cursor = this.getCursorClass(ui.cursorDirection);

    if(old.mode !== ui.mode) {
      console.log('Change mode', old.mode, ui.mode)
      if(this.handler) this.handler.release();
      switch(ui.mode){
        case Ui.MODE_NONE:
          break;
        case Ui.MODE_DRAG:
          this.handler = new MoveHandler(this.doc, this.store);
          break;
        case Ui.MODE_RESIZE:
          this.handler = new ResizeHandler(this.doc, this.store);
          break;
        case Ui.MODE_DRAW:
          this.handler = new DrawHandler(this.doc, this.store);
          break;
      }
    }
    if(old.mouseHandlerData !== ui.mouseHandlerData) {
      this.handler.update(ui.mouseHandlerData);
    }
  }
  // update elements position and size
  // update element container: change container or the container size
  onMetrics(selectables) {
    console.log('onMetrics', selectables.length);
    selectables.forEach(selectable => {
      // update metrics
      DomMetrics.setMetrics(selectable.el, selectable.metrics);
    });
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
  }
  onSelection(selectables) {
    // todo: useless, remove?
    console.log('onSelection', selectables.length);
  }
  onDraggable(selectables) {
    // todo: useless, remove?
    console.log('onDraggable', selectables.length);
  }
  onResizeable(selectables) {
    // todo: useless, remove?
    console.log('onResizeable', selectables.length);
  }
  onDroppable(selectables) {
    // todo: useless, remove?
    console.log('onDroppable', selectables.length);
  }
}