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
  constructor(private doc: HTMLDocument, private store: StageStore, private hooks: types.Hooks) {
    this.handler = null;
    store.subscribe(
      (state: types.UiState, prevState: types.UiState) => this.onUiStateChanged(state, prevState),
      (state:types.State) => state.ui
    )
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
      switch(state.mode){
        case types.UiMode.NONE:
          const selection = this.store.getState().selectables.filter(s => s.selected);
          if(prevState.mode === types.UiMode.DRAG) {
            this.hooks.onDrop(selection);
          }
          if(prevState.mode === types.UiMode.RESIZE) {
            this.hooks.onResize(selection);
          }
          break;
        case types.UiMode.DRAG:
          this.handler = new MoveHandler(this.doc, this.store, this.hooks);
          break;
        case types.UiMode.RESIZE:
          this.handler = new ResizeHandler(this.doc, this.store, this.hooks);
          break;
        case types.UiMode.DRAW:
          this.handler = new DrawHandler(this.doc, this.store, this.hooks);
          break;
      }
    }
  }
}
