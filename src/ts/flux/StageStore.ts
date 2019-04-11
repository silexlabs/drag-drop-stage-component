import * as redux from 'redux';
import * as types from '../Types';
import { selection } from './SelectionState';
import * as selectableState from './SelectableState';
import * as mouseState from './MouseState';
import * as uiState from './UiState';
import * as DomMetrics from '../utils/DomMetrics';

export class StageStore implements redux.Store<types.State> {
  /**
   * @param {Hooks}
   * @return {DomModel}
   */
  static selectablesFromDom(doc, hooks: types.Hooks): Array<types.SelectableState> {
    return Array
    .from(doc.querySelectorAll('*'))
    .filter((el: HTMLElement) => hooks.isSelectableHook(el))
    .map((el: HTMLElement): types.SelectableState => ({
      el,
      selected: false,
      dropping: false,
      draggable: hooks.isDraggableHook(el),
      resizeable: hooks.isResizeableHook(el),
      isDropZone: hooks.isDropZoneHook(el),
      useMinHeight: hooks.useMinHeightHook(el),
      metrics: DomMetrics.getMetrics(el),
    }));
  }
  /**
   * Create a redux store with composed reducers
   * @return redux.Store
   */
  protected static createStore(): redux.Store<types.State> {
    const reducer = redux.combineReducers({
      selectables: (state: Array<types.SelectableState>, action) => selectableState.selectables(selection(state, action), action),
      ui: (state: types.UiState, action) => uiState.ui(state, action),
      mouse: (state: types.MouseState, action) => mouseState.mouse(state, action),
    });
    return redux.createStore(reducer) as redux.Store<types.State>;
  };

  /**
   * the main redux store
   * @type {redux.Store}
   */
  protected store: redux.Store<types.State> = StageStore.createStore();

  /**
   * Subscribe to state changes with the ability to filter by substate
   * @param onChange callback to get the state and the previous state
   * @param select method to select the sub state
   * @return {function()} function to call to unsubscribe
   */
  subscribe<SubState>(onChange: (state:SubState, prevState:SubState) => void, select=(state:types.State):SubState => (state as any)) {
    let currentState = select(this.store.getState());

    const handleChange = () => {
      let nextState = select(this.store.getState());
      if (nextState !== currentState) {
        let prevState = currentState;
        currentState = nextState;
        onChange(currentState, prevState);
      }
    }
    return this.store.subscribe(handleChange);
  }
  dispatch(action: any): any {
    return this.store.dispatch(action);
  }
  getState(): types.State {
    return this.store.getState();
  }
  replaceReducer() {
    throw new Error('not implemented');
  }
}
