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
    // events from inside the iframe
    this.win.addEventListener('scroll', (e) => this.scroll(e), true);
    this.win.document.body.addEventListener('mousedown', (e) => this.down(e), true);
    this.win.document.body.addEventListener('mouseup', (e) => this.up(e), true);
    this.win.document.body.addEventListener('mousemove', (e) => this.move(e), true);
    // events from outside of the iframe
    document.body.addEventListener('mouseup', (e) => this.upOut(e), true);
    document.body.addEventListener('mousemove', (e) => this.moveOut(e), true);
  }
  //////////////////////////////
  scroll(e: MouseEvent) {
    const scroll = DomMetrics.getScroll(this.win.document);
    this.store.dispatch(MouseState.setScroll(scroll));
  }
  down(e: MouseEvent) {
    e.preventDefault(); // prevent default text selection
    const mouseData = this.eventToMouseData(e);
    this.mouseMode = MouseMode.DOWN;
    this.onDown(mouseData);
  }
  up(e: MouseEvent, offset: ClientRect = null) {
    e.preventDefault();
    const mouseData = this.eventToMouseData(e, offset);
    if(this.mouseMode === MouseMode.DOWN) {
      this.onUp(mouseData);
    }
    else if (this.mouseMode === MouseMode.DRAGGING) {
      this.onStopDrag(mouseData);
    }
    this.mouseMode = MouseMode.UP;
  }
  move(e: MouseEvent, offset: ClientRect = null) {
    e.preventDefault();
    const mouseData = this.eventToMouseData(e, offset);
    switch(this.mouseMode) {
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
  }

  upOut(e: MouseEvent) {
    if(this.mouseMode !== MouseMode.UP) {
      const iframe = this.win.frameElement.getBoundingClientRect();
      this.up(e, iframe);
    }
  }
  moveOut(e: MouseEvent) {
    if(this.mouseMode !== MouseMode.UP) {
      const iframe = this.win.frameElement.getBoundingClientRect();
      this.move(e, iframe);
    }
  }

  eventToMouseData(e: MouseEvent, offset: ClientRect = null): types.MouseData {
    return {
      movementX: e.movementX,
      movementY: e.movementY,
      mouseX: e.clientX - (offset ? offset.left : 0),
      mouseY: e.clientY - (offset ? offset.top : 0),
      shiftKey: e.shiftKey,
      target: e.target as HTMLElement,
    };
  }

  /////////////////////////////////////

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
    this.store.dispatch(MouseState.setMouseData(mouseData));
  }

  onStartDrag(mouseData: types.MouseData) {
    // update mouse data
    this.store.dispatch(MouseState.setMouseData(mouseData));
    // draw or resize or move
    const selectable = DomMetrics.getSelectable(this.store, mouseData.target as HTMLElement);
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

  onStopDrag(mouseData: types.MouseData) {
    this.store.dispatch(UiState.setMode(types.UiMode.NONE));
  }
}
