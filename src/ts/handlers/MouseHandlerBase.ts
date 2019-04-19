import * as types from '../Types';
import { StageStore } from '../flux/StageStore';
import { Hooks, MouseData, SelectableState } from '../Types';
import * as mouseState from '../flux/MouseState';

export class MouseHandlerBase {
  selection: Array<SelectableState>;
  unsubsribe: () => void;
  private unsubsribeScroll: () => void;
  constructor(protected stageDocument: HTMLDocument, private overlayDocument: HTMLDocument, protected store: StageStore, protected hooks: Hooks) {
    // store the selection
    this.selection = store.getState().selectables
    this.selection = this.selection.filter(selectable => selectable.selected);

    // kepp in sync with mouse
    this.unsubsribe = store.subscribe(
      (state: types.MouseState, prevState: types.MouseState) => this.update(state.mouseData),
      (state:types.State) => state.mouse
    );

    // listen for scroll
    this.unsubsribeScroll = this.store.subscribe(
      (cur: types.ScrollData, prev: types.ScrollData) => this.onScroll(cur, prev),
      (state: types.State): types.ScrollData => state.mouse.scrollData
    );
  }
  update(mouseData: MouseData) {};
  release() {
    this.unsubsribeScroll();
    this.unsubsribe();
  };


  /**
   * Debounce mechanism to handle auto scroll
   */
  private debounceScrollPending = false;
  private debounceScrollData: types.ScrollData;
  protected debounceScroll(scrollData: types.ScrollData) {
    if(!this.debounceScrollPending) {
      setTimeout(() => {
        this.debounceScrollPending = false;
        this.store.dispatch(mouseState.setScroll(this.debounceScrollData));
      }, 100);
    }
    this.debounceScrollPending = true;
    this.debounceScrollData = scrollData;
  }


  /**
   *  move the dragged elements back under the mouse
   */
  onScroll(state: types.ScrollData, prev: types.ScrollData) {
    const delta = {
      x: state.x - prev.x,
      y: state.y - prev.y,
    }
    const mouseData = this.store.getState().mouse.mouseData;
    // mouse did not move in the viewport, just in the document coordinate
    // the selection need to follow the mouse
    this.update({
      ...mouseData,
      movementX: delta.x,
      movementY: delta.y,
    })
  }
}
