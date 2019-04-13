import * as types from './Types';
import * as DomMetrics from './utils/DomMetrics';
import * as MouseState from './flux/MouseState';
import { StageStore } from './flux/StageStore';
import * as SelectionAction from './flux/SelectionState';
import * as UiState from './flux/UiState';

export enum MouseMode {
  UP,
  DOWN,
  DRAGGING,
}

export class Mouse {
  mouseMode = MouseMode.UP; // public for unit tests
  private wasMultiSelected: boolean = false;
  constructor(private win, private store: StageStore) {
    this.win.addEventListener('scroll', (e) => this.scroll(e), true);
    this.win.document.body.addEventListener('mousedown', (e) => this.down(e), true);
    this.win.document.body.addEventListener('mouseup', (e) => this.up(e), true);
    this.win.document.body.addEventListener('mousemove', (e) => this.move(e), true);
  }
  //////////////////////////////
  scroll(e: MouseEvent) {
    const scroll = DomMetrics.getScroll(this.win.document);
    this.store.dispatch(MouseState.setScroll(scroll));
  }
  down(e: MouseEvent) {
    e.preventDefault(); // prevent default text selection
    this.mouseMode = MouseMode.DOWN;
    this.onDown(e);
  }
  up(e: MouseEvent) {
    e.preventDefault();
    if(this.mouseMode === MouseMode.DOWN) {
      this.onUp(e);
    }
    else if (this.mouseMode === MouseMode.DRAGGING) {
      this.onStopDrag(e);
    }
    this.mouseMode = MouseMode.UP;
  }
  move(e: MouseEvent) {
    e.preventDefault();
    switch(this.mouseMode) {
      case MouseMode.DOWN:
        this.mouseMode = MouseMode.DRAGGING;
        this.onStartDrag(e);
        break;
      case MouseMode.DRAGGING:
        this.onDrag(e);
        break;
      default:
       this.onMove(e);
    }
  }

  /////////////////////////////////////
  /**
   * @param  {Event} e
   */
  onDown(e: MouseEvent) {
    const {target, shiftKey} = e;
    const selectable = DomMetrics.getSelectable(this.store, target as HTMLElement);
    if(selectable) {
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


  /**
   * @param  {Event} e
   */
  onUp(e: MouseEvent) {
    const {target, shiftKey} = e;
    const selectable = DomMetrics.getSelectable(this.store, target as HTMLElement);
    if(selectable) {
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


  /**
   * @param  {Event} e
   */
  onMove(e: MouseEvent) {
    const {clientX, clientY, target} = e;
    const selectable = DomMetrics.getSelectable(this.store, target as HTMLElement);
    this.store.dispatch(MouseState.setCursorData(DomMetrics.getCursorData(clientX, clientY, this.store.getState().mouse.scrollData, selectable)));
  }


  /**
   * @param  {Event} e
   */
  onDrag(e: MouseEvent) {
    this.store.dispatch(MouseState.setMouseData(this.eventToMouseData(e)));
  }

  eventToMouseData(e: MouseEvent): types.MouseData {
    return {
      movementX: e.movementX,
      movementY: e.movementY,
      mouseX: e.clientX,
      mouseY: e.clientY,
      shiftKey: e.shiftKey,
      target: e.target as HTMLElement,
    };
  }

  /**
   * @param  {Event} e
   */
  onStartDrag(e: MouseEvent) {
    // update mouse data
    this.store.dispatch(MouseState.setMouseData(this.eventToMouseData(e)));
    // draw or resize or move
    const selectable = DomMetrics.getSelectable(this.store, e.target as HTMLElement);
    if(selectable) {
      const direction = this.store.getState().mouse.cursorData;
      // start resize
      if(selectable.resizeable && (direction.x != '' || direction.y != '')) {
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


  /**
   * Stop drag
   * @private
   */
  onStopDrag(e: MouseEvent) {
    this.store.dispatch(UiState.setMode(types.UiMode.NONE));
  }
}
