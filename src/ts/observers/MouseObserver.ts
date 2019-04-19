import * as DomMetrics from '../utils/DomMetrics';
import * as types from '../Types';
import {StageStore} from '../flux/StageStore';

/**
 * @class This class listens to the store
 *   and apply the state changes to the view
 */
export class MouseObserver {
  constructor(private stageDocument: HTMLDocument, private overlayDocument: HTMLDocument, store: StageStore, private hooks: types.Hooks) {
    this.unsubscribeAll.push(store.subscribe(
      (state: types.MouseState, prevState: types.MouseState) => this.onStateChanged(state, prevState),
      (state:types.State) => state.mouse
    ));
  }

  private unsubscribeAll: Array<() => void> = [];
  cleanup() {
    this.unsubscribeAll.forEach(u => u());
  }

  /**
   * handle state changes, detect changes of scroll or metrics or selection
   * @param {State} state
   * @param {State} prevState the old state obj
   */
  onStateChanged(state: types.MouseState, prevState: types.MouseState) {
    if(state.scrollData.x !== prevState.scrollData.x || state.scrollData.y !== prevState.scrollData.y) {
      DomMetrics.setScroll(this.stageDocument, state.scrollData);
    }
    // this is now in Ui.ts
    // if(state.cursorData.cursorType !== prevState.cursorData.cursorType) {
    //   this.doc.body.style.cursor = state.cursorData.cursorType;
    // }
  }
}