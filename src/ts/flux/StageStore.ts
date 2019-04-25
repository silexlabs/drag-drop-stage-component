import { applyMiddleware, combineReducers, createStore, Store } from 'redux';
import { MouseState, SelectableState, State, UiState } from '../Types';
import * as mouseState from './MouseState';
import * as selectableState from './SelectableState';
import { selection } from './SelectionState';
import { ui } from './UiState';

export class StageStore implements Store<State> {
  /**
   * Create a redux store with composed reducers
   * @return Store
   */
  protected static createStore(): Store<State> {
    const reducer = combineReducers({
      selectables: (state: Array<SelectableState>, action) => selectableState.selectables(selection(state, action), action),
      ui: (state: UiState, action) => ui(state, action),
      mouse: (state: MouseState, action) => mouseState.mouse(state, action),
    });
    return createStore(reducer, applyMiddleware(StageStore.preventDispatchDuringRedraw)) as Store<State>;
  };

  // this is unused for now, I used the "refreshing" prop instead, on state.ui
  private static preventDispatchDuringRedraw({ getState }) {
    return next => action => {
      if(action.preventDispatch) {
        console.warn('prevent dispatch', action)
      }
      else {
        const returnValue = next(action)
        return returnValue
      }
      return null;
    }
  }

  /**
   * the main redux store
   * @type {Store}
   */
  protected store: Store<State> = StageStore.createStore();

  /**
   * Subscribe to state changes with the ability to filter by substate
   * @param onChange callback to get the state and the previous state
   * @param select method to select the sub state
   * @return {function()} function to call to unsubscribe
   */
  subscribe<SubState>(onChange: (state:SubState, prevState:SubState) => void, select=(state:State):SubState => (state as any)) {
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
  // clone the object, not deep
  clone<SubState>(obj: SubState): SubState {
    let res: any;
    if(obj instanceof Array) res = (obj as Array<any>).slice() as any as SubState;
    else if(obj instanceof Object) res = {
        ...(obj as any as Object),
      } as SubState;
    else res = obj;
    if(obj === res) throw 'not cloned';
    return res;
  }
  dispatch(action: any, cbk: () => void = null): any {
    this.store.dispatch(action);
    if(cbk) cbk();
    return null;
  }
  getState(): State {
    return this.store.getState();
  }
  replaceReducer() {
    throw new Error('not implemented');
  }
}
