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

const BORDER_SIZE = 10;


const CURSOR_DEFAULT = 'default';
const CURSOR_SELECT = 'pointer';
const CURSOR_MOVE = 'move';
const CURSOR_NW = 'nw-resize';
const CURSOR_NE = 'ne-resize';
const CURSOR_SW = 'sw-resize';
const CURSOR_SE = 'se-resize';
const CURSOR_W = 'w-resize';
const CURSOR_E = 'e-resize';
const CURSOR_N = 'n-resize';
const CURSOR_S = 's-resize';


export class Mouse {
  private mouseMode = MouseMode.UP;
  private wasMultiSelected: boolean = false;
  constructor(private win, private store: StageStore) {
    this.win.addEventListener('scroll', (e) => this.scroll(e), true);
    this.win.addEventListener('down', (e) => this.down(e), true);
    this.win.addEventListener('up', (e) => this.up(e), true);
    this.win.addEventListener('move', (e) => this.move(e), true);
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
  /////////////////////////////////
  getSelectableState(el) {
    return this.store.getState().selectables.find(selectable => selectable.el === el);
  }


  getSelection() {
    return this.store.getState().selectables.filter(selectable => selectable.selected);
  }


  /**
   * returns the state of the first container which is selectable
   * or null if the element and none of its parents are selectable
   */
  getSelectable(element) {
    let el = element;
    let data;
    while(!!el && !(data = this.getSelectableState(el))) {
      el = el.parentElement;
    }
    return data;
  }


  /**
   * check if an element has a parent which is selected and draggable
   * @param {HTMLElement} selectable
   */
  hasASelectedDraggableParent(selectable) {
    const selectableParent = this.getSelectable(selectable.parentElement);
    if(selectableParent) {
      if(selectableParent.selected && selectableParent.draggable) return true;
      else return this.hasASelectedDraggableParent(selectableParent.el);
    }
    else {
      return false;
    }
  }

  getResizeCursorClass(direction) {
    if(direction.x === 'left' && direction.y === 'top') return CURSOR_NW;
    else if(direction.x === 'right' && direction.y === 'top') return CURSOR_NE;
    else if(direction.x === 'left' && direction.y === 'bottom') return CURSOR_SW;
    else if(direction.x === 'right' && direction.y === 'bottom') return CURSOR_SE;
    else if(direction.x === 'left' && direction.y === '') return CURSOR_W;
    else if(direction.x === 'right' && direction.y === '') return CURSOR_E;
    else if(direction.x === '' && direction.y === 'top') return CURSOR_N;
    else if(direction.x === '' && direction.y === 'bottom') return CURSOR_S;
    throw new Error('direction not found');
  }

  /////////////////////////////////////
  /**
   * @param  {Event} e
   */
  onDown(e: MouseEvent) {
    const {target, shiftKey} = e;
    const selectable = this.getSelectable(target);
    if(selectable) {
      this.wasMultiSelected = this.getSelection().length > 1 && selectable.selected;
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
    const selectable = this.getSelectable(target);
    if(selectable) {
      if(shiftKey) {
        if(this.wasMultiSelected || selectable.selected) {
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
    const selectable = this.getSelectable(target);
    if(selectable) {
      const direction = this.getDirection(clientX, clientY, selectable);
      if(selectable.resizeable && direction) {
        this.store.dispatch(MouseState.setCursorData({
          x: direction.x,
          y: direction.y,
          cssClass: this.getResizeCursorClass(direction),
        }));
      }
      else if(selectable.draggable) {
        this.store.dispatch(MouseState.setCursorData({
          x: '',
          y: '',
          cssClass: CURSOR_MOVE,
        }));
      }
      else if(selectable.selected) {
        this.store.dispatch(MouseState.setCursorData({
          x: '',
          y: '',
          cssClass: CURSOR_SELECT,
        }));
      }
      else {
        this.store.dispatch(MouseState.setCursorData({
          x: '',
          y: '',
          cssClass: CURSOR_DEFAULT,
        }));
      }
    }
    else {
      this.store.dispatch(MouseState.setCursorData({
        x: '',
        y: '',
        cssClass: CURSOR_DEFAULT,
      }));
    }
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
  getDirection(clientX, clientY, selectable) {
    const bb = selectable.metrics.clientRect;
    const distFromBorder = {
      left: clientX - bb.left,
      right: bb.width + bb.left - clientX,
      top: clientY - bb.top,
      bottom: bb.height + bb.top - clientY,
    }
    // get resize direction
    const direction = { x: '', y: '' };
    if(distFromBorder.left < BORDER_SIZE) direction.x = 'left';
    else if(distFromBorder.right < BORDER_SIZE) direction.x = 'right';
    if(distFromBorder.top < BORDER_SIZE) direction.y = 'top';
    else if(distFromBorder.bottom < BORDER_SIZE) direction.y = 'bottom';
    return direction;
  }

  /**
   * @param  {Event} e
   */
  onStartDrag(e: MouseEvent) {
    // update mouse data
    this.store.dispatch(MouseState.setMouseData(this.eventToMouseData(e)));
    // draw or resize or move
    const selectable = this.getSelectable(e.target);
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
