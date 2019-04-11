import * as DomMetrics from '../utils/DomMetrics';
import * as types from '../Types';
import {StageStore} from '../flux/StageStore';
import { MouseHandlerBase } from '../handlers/MouseHandlerBase';

/**
 * @class This class listens to the store
 *   and apply the state changes to the view
 */
export class MouseObserver {
  constructor(private doc, store: StageStore, private hooks: types.Hooks) {
    store.subscribe(
      (state: types.MouseState, prevState: types.MouseState) => this.onStateChanged(state, prevState),
      (state:types.State) => state.mouse
    )
  }
  /**
   * handle state changes, detect changes of scroll or metrics or selection
   * @param {State} state
   * @param {State} prevState the old state obj
   */
  onStateChanged(state: types.MouseState, prevState: types.MouseState) {
    if(state.scrollData.x !== prevState.scrollData.x || state.scrollData.y !== prevState.scrollData.y) {
      DomMetrics.setScroll(this.doc, state.scrollData);
    }
    if(state.cursorData.cssClass !== prevState.cursorData.cssClass) {
      this.doc.body.style.cursor = state.cursorData.cssClass;
    }
    if(state.mouseData.target !== prevState.mouseData.target) {
      if(prevState.mouseData.target) prevState.mouseData.target.classList.remove('hovered');
      if(state.mouseData.target) state.mouseData.target.classList.add('hovered');
    }
  }
}