import * as types from './Types';
import * as DomMetrics from './utils/DomMetrics';
import * as MouseState from './flux/MouseState';
import { StageStore } from './flux/StageStore';
import * as SelectionAction from './flux/SelectionState';
import * as UiState from './flux/UiState';
import { addEvent } from './utils/Events';
import { updateSelectables } from './flux/SelectableState';

export enum MouseMode {
  UP,
  DOWN,
  DRAGGING,
  WAITING_DBL_CLICK_DOWN,
  WAITING_DBL_CLICK_DOWN2,
  WAITING_DBL_CLICK_UP,
}

export class Mouse {
  mouseMode = MouseMode.UP; // public for unit tests
  private wasMultiSelected: boolean = false;
  constructor(private winStage: Window, private winOverlay: Window, private store: StageStore, private hooks: types.Hooks) {
    // events from inside the iframe
    this.unsubscribeAll.push(
      addEvent(this.winOverlay, 'scroll', (e:MouseEvent) => this.scroll(e), true),
      addEvent(this.winOverlay.document, 'mousedown', (e:MouseEvent) => this.down(e), true),
      addEvent(this.winOverlay.document, 'mouseup', (e:MouseEvent) => this.up(e), true),
      addEvent(this.winOverlay.document, 'mousemove', (e:MouseEvent) => this.move(e), true),

      // events from outside of the iframe
      addEvent(document, 'mouseup', (e:MouseEvent) => this.upOut(e), true),
      addEvent(document, 'mousemove', (e:MouseEvent) => this.moveOut(e), true),
    );
  }
  private unsubscribeAll: Array<() => void> = [];
  cleanup() {
    this.unsubscribeAll.forEach(u => u());
  }
  /**
   * safe subscribe to mouse event
   * handle the multiple iframes and the current window
   * @return function to call to unsubscribe
   */
  subscribeMouseEvent(type, cbk): () => void {
    const unsubscribeArray = [
      addEvent(this.winOverlay, type, (e:MouseEvent) => cbk(e), true),
      addEvent(document, type, (e:MouseEvent) => cbk(e), true),
    ];
    return () => unsubscribeArray.forEach(u => u());
  }
  //////////////////////////////
  scroll(e: MouseEvent) {
    const scroll = DomMetrics.getScroll(this.winOverlay.document);
    this.store.dispatch(MouseState.setScroll(scroll));
  }

  private clearTimeout: () => void;
  private firstOnDownMouseData: types.MouseData;
  down(e: MouseEvent) {
    if(!this.store.getState().ui.catchingEvents) return;
    try {
      // in firefox, this is needed to keep recieving events while dragging outside the iframe
      // in chrome this will throw an error
      // e.target['setCapture']();
      // Firefox now warns: Element.setCapture() is deprecated. Use Element.setPointerCapture() instead. For more help https://developer.mozilla.org/docs/Web/API/Element/setPointerCapture
      e.target['setPointerCapture']();
    }
    catch(e) {}
    e.preventDefault(); // prevent default text selection
    const mouseData = this.eventToMouseData(e);
    if(this.mouseMode === MouseMode.WAITING_DBL_CLICK_UP) {
      this.mouseMode = MouseMode.WAITING_DBL_CLICK_DOWN2;
    }
    else if (this.mouseMode === MouseMode.DRAGGING) {
      // this happens when forcing drag/drop with Stage::startDrag
      this.mouseMode = MouseMode.UP;
      this.onDrop(mouseData);
    }
    else {
      this.mouseMode = MouseMode.WAITING_DBL_CLICK_DOWN;
      this.firstOnDownMouseData = mouseData;
      const id = setTimeout(() => {
        if(this.mouseMode === MouseMode.WAITING_DBL_CLICK_DOWN) {
          this.mouseMode = MouseMode.DOWN;
          this.firstOnDownMouseData = null;
          this.onDown(mouseData);
        }
        else if(this.mouseMode === MouseMode.WAITING_DBL_CLICK_UP) {
          this.mouseMode = MouseMode.DOWN;
          this.firstOnDownMouseData = null;
          this.onDown(mouseData);
          this.mouseMode = MouseMode.UP;
          this.onUp(mouseData);
        }
      }, 300);
      this.clearTimeout = () => {
        clearTimeout(id);
        this.clearTimeout = null;
      }
    }
  }
  up(e: MouseEvent, offset: ClientRect = null) {
    if(!this.store.getState().ui.catchingEvents) return;

    e.preventDefault();
    const mouseData = this.eventToMouseData(e, offset);
    if(this.mouseMode === MouseMode.WAITING_DBL_CLICK_DOWN) {
      this.mouseMode = MouseMode.WAITING_DBL_CLICK_UP;
    }
    else if(this.mouseMode === MouseMode.WAITING_DBL_CLICK_DOWN2) {
      this.clearTimeout();
      this.mouseMode = MouseMode.UP;
      this.onDblClick(mouseData);
    }
    else if(this.mouseMode === MouseMode.DOWN) {
      this.mouseMode = MouseMode.UP;
      this.onUp(mouseData);
    }
    else if (this.mouseMode === MouseMode.DRAGGING) {
      this.mouseMode = MouseMode.UP;
      this.onDrop(mouseData);
    }
  }
  move(e: MouseEvent, offset: ClientRect = null) {
    if(!this.store.getState().ui.catchingEvents) return;

    e.preventDefault();
    const mouseData = this.eventToMouseData(e, offset);

    // update mouse data
    this.store.dispatch(MouseState.setMouseData(mouseData));

    // update hovered state
    // one could use the store.getState().mouseState.mouseData.hovered
    // but the change event is used by the Ui.ts to detect that a box should change
    const updated = this.store.getState().selectables
      .filter((state) => state.hovered !== mouseData.hovered.includes(state.el));
    if (updated.length > 0) { 
      this.store.dispatch(updateSelectables(updated
        .map((state) => ({
          ...state,
          hovered: mouseData.hovered.includes(state.el),
        }))))
    }

    // chose action depending on position and state
    switch(this.mouseMode) {
      case MouseMode.WAITING_DBL_CLICK_UP:
        this.mouseMode = MouseMode.DOWN;
        this.onDown(this.firstOnDownMouseData);
        this.mouseMode = MouseMode.UP;
        this.onUp(this.firstOnDownMouseData);
        this.onMove(mouseData);
        break;
      case MouseMode.WAITING_DBL_CLICK_DOWN:
      case MouseMode.WAITING_DBL_CLICK_DOWN2:
        this.mouseMode = MouseMode.DOWN;
        this.onDown(this.firstOnDownMouseData);
        // no break; here
      case MouseMode.DOWN:
        this.mouseMode = MouseMode.DRAGGING;
        this.onStartDrag(mouseData);
        break;
      case MouseMode.DRAGGING:
        this.onDrag(mouseData);
        break;
      default:
       this.onMove(mouseData);
    }
    this.firstOnDownMouseData = null;
  }

  upOut(e: MouseEvent) {
    if(this.mouseMode !== MouseMode.UP) {
      const iframe = this.winOverlay.frameElement.getBoundingClientRect();
      this.up(e, iframe);
    }
  }
  moveOut(e: MouseEvent) {
    if(this.mouseMode !== MouseMode.UP) {
      const iframe = this.winOverlay.frameElement.getBoundingClientRect();
      this.move(e, iframe);
    }
  }

  eventToMouseData(e: MouseEvent, offset: ClientRect = null): types.MouseData {
    const x = e.clientX - (offset ? offset.left : 0);
    const y = e.clientY - (offset ? offset.top : 0);
    const hovered = DomMetrics.findSelectableUnderMouse(this.winStage.document, this.store, x, y) as HTMLElement[];
    const target = !!hovered ? hovered[0] : null;
    return {
      movementX: e.movementX,
      movementY: e.movementY,
      mouseX: x,
      mouseY: y,
      shiftKey: e.shiftKey,
      target,
      hovered,
    };
  }

  /////////////////////////////////////

  onDblClick(mouseData: types.MouseData) {
    const {target, shiftKey} = mouseData;
    const selectable = DomMetrics.getSelectable(this.store, target as HTMLElement);
    if(shiftKey) {
      this.store.dispatch(SelectionAction.add(selectable));
    }
    else if(selectable) {
      if(!selectable.selected) {
        this.store.dispatch(SelectionAction.set([selectable]));
      }
    }
    if(this.hooks.onEdit) this.hooks.onEdit();
  }

  onDown(mouseData: types.MouseData) {
    const {target, shiftKey} = mouseData;
    const selectable = DomMetrics.getSelectable(this.store, target as HTMLElement);
    if(selectable && selectable.selectable) {
      this.wasMultiSelected = DomMetrics.getSelection(this.store).length > 1 && selectable.selected;
      if(this.wasMultiSelected || shiftKey) {
        this.store.dispatch(SelectionAction.add(selectable));
      }
      else {
        this.store.dispatch(SelectionAction.set([selectable]));
      }
    }
    else {
      this.wasMultiSelected = false;
    }
  }


  onUp(mouseData: types.MouseData) {
    const {target, shiftKey} = mouseData;
    const selectable = DomMetrics.getSelectable(this.store, target as HTMLElement);
    if(selectable && selectable.selectable) {
      if(shiftKey) {
        if(this.wasMultiSelected && selectable.selected) {
          this.store.dispatch(SelectionAction.remove(selectable));
        }
      }
      else {
        this.store.dispatch(SelectionAction.set([selectable]));
      }
    }
    else if(!shiftKey) {
      this.store.dispatch(SelectionAction.reset());
    }
    this.wasMultiSelected = false;
  }


  onMove(mouseData: types.MouseData) {
    const {mouseX, mouseY, target} = mouseData;
    const selectable = DomMetrics.getSelectable(this.store, target as HTMLElement);
    this.store.dispatch(MouseState.setCursorData(DomMetrics.getCursorData(mouseX, mouseY, this.store.getState().mouse.scrollData, selectable)));
  }


  onDrag(mouseData: types.MouseData) {
  }

  onStartDrag(mouseData: types.MouseData) {
    // draw or resize or move
    const selectable = DomMetrics.getSelectable(this.store, mouseData.target as HTMLElement);
    if(selectable) {
      const direction = this.store.getState().mouse.cursorData;
      // start resize
      if(DomMetrics.isResizeable(selectable.resizeable, direction)) {
        this.store.dispatch(UiState.setMode(types.UiMode.RESIZE));
      }
      // start drag
      else if(selectable.draggable) {
        this.store.dispatch(UiState.setMode(types.UiMode.DRAG));
      }
      else {
        this.store.dispatch(UiState.setMode(types.UiMode.DRAW));
      }
    }
    else {
      this.store.dispatch(UiState.setMode(types.UiMode.DRAW));
    }
  }

  onDrop(mouseData: types.MouseData) {
    this.store.dispatch(UiState.setMode(types.UiMode.NONE));
  }
}
