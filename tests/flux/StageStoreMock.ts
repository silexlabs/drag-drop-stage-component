import {StageStore} from '../../src/ts/flux/StageStore';
import * as types from '../../src/ts/Types';

export const hooks = {
  isSelectableHook: (el => el.classList.contains('i-am-selectable')),
  isDraggableHook: (el => true),
  isDropZoneHook: (el => true),
  isResizeableHook: (el => true),
  useMinHeight: (el => true),
  canDrop: (el => true),
};

export class StageStoreMock extends StageStore {
  static elem1;
  static elem2;

  preventDispatch = false;

  cbks = [];
  subscribe<SubState>(onChange: (state:SubState, prevState:SubState) => void, select=(state:types.State):SubState => (state as any)) {
    this.cbks.push((state:types.State, prevState:types.State) => onChange(select(state), select(prevState)));
    return () => {
      // console.log('unsubscribe called')
    };
  }

  dispatch(action: any, idx: number = 0): any {
    // console.log('Dispatch', action, 'to', idx+1, '/', this.cbks.length);
    if(!this.preventDispatch && this.cbks[idx]) this.cbks[idx](this.getState(), this.initialState);
    return null;
  }

  selectableElem1: types.SelectableState = {
    el: StageStoreMock.elem1,
    selected: false,
    dropping: false,
    draggable: true,
    resizeable: true,
    isDropZone: true,
    useMinHeight: true,
    metrics: {
      position: 'absolute',
      proportions: 1,
      margin: {top: 0, left: 0, bottom: 0, right: 0 },
      padding: {top: 0, left: 0, bottom: 0, right: 0 },
      border: {top: 0, left: 0, bottom: 0, right: 0 },
      computedStyleRect: {top: 100, left: 100, bottom: 200, right: 200, width: 100, height: 100 },
      clientRect: {top: 100, left: 100, bottom: 200, right: 200, width: 100, height: 100 },
    },
  };
  selectableElem2: types.SelectableState = {
    el: StageStoreMock.elem2,
    selected: false,
    dropping: false,
    draggable: true,
    resizeable: true,
    isDropZone: true,
    useMinHeight: true,
    metrics: {
      position: 'static',
      proportions: 1,
      margin: {top: 0, left: 0, bottom: 0, right: 0 },
      padding: {top: 0, left: 0, bottom: 0, right: 0 },
      border: {top: 0, left: 0, bottom: 0, right: 0 },
      computedStyleRect: {top: 10, left: 10, bottom: 20, right: 20, width: 10, height: 10 },
      clientRect: {top: 10, left: 10, bottom: 20, right: 20, width: 10, height: 10 },
    },
  };
  uiState: types.UiState = {
    mode: types.UiMode.NONE,
  };
  mouseState: types.MouseState = {
    scrollData: {x: 0, y: 0},
    cursorData: {x: '', y: '', cursorType: ''},
    mouseData: {
      movementX: 0,
      movementY: 0,
      mouseX: 0,
      mouseY: 0,
      shiftKey: false,
      target: null,
    },
  };
  initialState = {
    selectables: [this.selectableElem1, this.selectableElem2],
    ui: this.uiState,
    mouse: this.mouseState,
  };
  state = {
    selectables: [this.selectableElem1, this.selectableElem2],
    ui: this.uiState,
    mouse: this.mouseState,
  };
  getState(): types.State {
    return this.state;
  }
}
