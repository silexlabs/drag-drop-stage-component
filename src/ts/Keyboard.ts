import { StageStore } from "./flux/StageStore";
import { addEvent } from "./utils/Events";
import { setMode } from "./flux/UiState";
import { reset } from "./flux/SelectionState";
import { UiMode } from "./Types";

export class Keyboard {
  constructor(private win, private store: StageStore) {
    // events from inside the iframe
    this.unsubscribeAll.push(
      addEvent(window, "keydown", (e: KeyboardEvent) => this.onKeyDown(e.key)),
      addEvent(win, "keydown", (e: KeyboardEvent) => this.onKeyDown(e.key)),
    );
  }

  private unsubscribeAll: Array<() => void> = [];
  cleanup() {
    this.unsubscribeAll.forEach(u => u());
  }

  /**
   * handle shortcuts
   */
  private onKeyDown(key) {
    const state = this.store.getState();
    switch(key) {
      case 'Escape':
        if(state.ui.mode !== UiMode.NONE) {
          this.store.dispatch(setMode(UiMode.NONE));
          this.store.dispatch(reset());
        }
        break;
      case 'Enter':
        if(state.ui.mode !== UiMode.EDIT && state.selectables.filter(s => s.selected).length > 0) {
          this.store.dispatch(setMode(UiMode.EDIT));
        }
        break;
      default:
    }
  }
}