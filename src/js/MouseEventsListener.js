import * as DomMetrics from './utils/DomMetrics';
import * as SelectionAction from './store/Selection';
import * as UiAction from './store/Ui';
import * as ScrollAction from './store/Scroll';
import {ResizeHandler} from './handlers/ResizeHandler';

export class MouseEventsListener {
  constructor(doc, mouse, store) {
    this.store = store;
    this.doc = doc;
    this.wasMultiSelected = false;
    mouse.on('scroll', (e) => this.onScroll());
    mouse.on('down', (e) => this.onDown(e));
    mouse.on('up', (e) => this.onUp(e));
    mouse.on('move', (e) => this.onMove(e));
    mouse.on('drag', (e) => this.onDrag(e));
    mouse.on('startDrag', (e) => this.onStartDrag(e));
    mouse.on('stopDrag', (e) => this.onStopDrag(e));
  }


  // /**
  //  * returns the state of the first container which is selectable
  //  * or null if the element and none of its parents are selectable
  //  */
  // getSelectable(element) {
  //   // let the main app.map(el) specify getSelectable and getDroppable
  //   let ptr = element;
  //   while(ptr && !this.hooks.isSelectableHook(ptr)) {
  //     ptr = ptr.parentElement;
  //   }
  //   if(ptr) return this.store.getState().selectables.find(selectable => selectable.el === ptr);
  //   return null;
  // }
  getData(el) {
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
    // let the main app.map(el) specify getSelectable and getDroppable
    let el = element;
    let data;
    while(!!el && !(data = this.getData(el))) {
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

  /**
   * @param  {Element}
   * @param  {Boolean}
   */
  onScroll() {
    const scroll = DomMetrics.getScroll(this.doc);
    const oldScroll = this.store.getState().scroll;
    if(scroll.x !== oldScroll.x || scroll.y !== oldScroll.y) {
      this.store.dispatch(ScrollAction.set(scroll));
    }
  }

  /**
   * @param  {Event} e
   */
  onDown(e) {
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
  onMove(e) {
    const {clientX, clientY, target} = e;
    const selectable = this.getSelectable(target);
    const oldDirection = this.store.getState().cursorDirection;
    if(selectable && selectable.resizeable) {
      const direction = ResizeHandler.getDirection(clientX, clientY, selectable);
      if(direction.x !== oldDirection.x || direction.y !== oldDirection.y){
        this.store.dispatch(UiAction.setCursorDirection(direction))
      }
    }
    else {
      if('' !== oldDirection.x || '' !== oldDirection.y){
        this.store.dispatch(UiAction.setCursorDirection({x: '', y: ''}))
      }
    }
  }


  /**
   * @param  {Event} e
   */
  onUp(e) {
    const {target, shiftKey} = e;
    const selectable = this.getSelectable(target);
    if(selectable) {
      if(shiftKey) {
        if(this.wasMultiSelected) {
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
  onDrag(e) {
    this.store.dispatch(UiAction.setMouseHandlerData(this.eventToMouseHandlerData(e)));
  }

  eventToMouseHandlerData(e) {
    return {
      movementX: e.movementX,
      movementY: e.movementY,
      clientX: e.clientX,
      clientY: e.clientY,
      shiftKey: e.shiftKey,
      target: e.target,
    };
  }

  /**
   * @param  {Event} e
   */
  onStartDrag(e) {
    const selectable = this.getSelectable(e.target);
    if(selectable) {
      const direction = this.store.getState().direction;
      // start resize
      if(selectable.resizeable && (direction.x != '' || direction.y != '')) {
        this.store.dispatch(UiAction.setModeResize(this.eventToMouseHandlerData(e)));
      }
      // start drag
      else if(selectable.draggable) {
        this.store.dispatch(UiAction.setModeDrag(this.eventToMouseHandlerData(e)));
      }
      else {
        this.startDrawing(e);
      }
    }
    else {
      this.startDrawing(e);
    }
  }

  startDrawing(e) {
    this.store.dispatch(UiAction.setModeDraw(this.eventToMouseHandlerData(e)));
  }


  /**
   * Stop drag
   * @private
   */
  onStopDrag(e) {
    if(this.handler) {
      this.handler.release();
      if(this.handler.type === 'MoveHandler' && this.handler.elementsData) { // not the draw handler
        const elements = this.handler.elementsData.map(data => data.target);
        this.emit('drop', elements.slice());
      }
    }
    this.handler = null;
  }
}
