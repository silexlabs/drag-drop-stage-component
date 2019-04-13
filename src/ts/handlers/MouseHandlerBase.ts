import * as types from '../Types';
import { StageStore } from '../flux/StageStore';
import { Hooks, MouseData, SelectableState } from '../Types';

export class MouseHandlerBase {
  selection: Array<SelectableState>;
  unsubsribe: () => void;
  constructor(protected doc: HTMLDocument, protected store: StageStore, protected hooks: Hooks) {
    // store the selection
    this.selection = store.getState().selectables
    this.selection = this.selection.filter(selectable => selectable.selected);

    // kepp in sync with mouse
    this.unsubsribe = store.subscribe(
      (state: types.MouseState, prevState: types.MouseState) => this.update(state.mouseData),
      (state:types.State) => state.mouse
    );
  }
  update(mouseData: MouseData) {};
  release() {
    this.unsubsribe();
  };
}
