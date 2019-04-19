import * as types from '../Types';
import {ResizeHandler} from '../handlers/ResizeHandler';
import {DrawHandler} from '../handlers/DrawHandler';
import {MoveHandler} from '../handlers/MoveHandler';
import {StageStore} from '../flux/StageStore';
import { MouseHandlerBase } from '../handlers/MouseHandlerBase';

/**
 * @class This class listens to the store
 *   and apply the state changes to the DOM elements
 */
export class UiObserver {
  private handler: MouseHandlerBase;
  constructor(private stageDocument: HTMLDocument, private overlayDocument: HTMLDocument, private store: StageStore, private hooks: types.Hooks) {
    this.handler = null;
    this.unsubscribeAll.push(store.subscribe(
      (state: types.UiState, prevState: types.UiState) => this.onUiStateChanged(state, prevState),
      (state:types.State) => state.ui
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
  onUiStateChanged(state: types.UiState, prevState: types.UiState) {
    if(prevState.mode !== state.mode) {
      if(this.handler) {
        this.handler.release();
        this.handler = null;
      }
      // add css class and style
      this.overlayDocument.body.classList.remove(...[
        state.mode !== types.UiMode.DRAG ? 'dragging-mode' : 'not-dragging-mode',
        state.mode !== types.UiMode.RESIZE ? 'resizing-mode' : 'not-resizing-mode',
      ]);
      this.overlayDocument.body.classList.add(...[
        state.mode === types.UiMode.DRAG ? 'dragging-mode' : 'not-dragging-mode',
        state.mode === types.UiMode.RESIZE ? 'resizing-mode' : 'not-resizing-mode',
      ]);
      // manage handlers
      switch(state.mode){
        case types.UiMode.NONE:
          break;
        case types.UiMode.DRAG:
          this.handler = new MoveHandler(this.stageDocument, this.overlayDocument, this.store, this.hooks);
          break;
        case types.UiMode.RESIZE:
          this.handler = new ResizeHandler(this.stageDocument, this.overlayDocument, this.store, this.hooks);
          break;
        case types.UiMode.DRAW:
          this.handler = new DrawHandler(this.stageDocument, this.overlayDocument, this.store, this.hooks);
          break;
      }
    }
  }
}
