import { StageStore } from "./flux/StageStore";
import { addEvent } from "./utils/Events";
import { setMode } from "./flux/UiState";
import { reset } from "./flux/SelectionState";
import { UiMode } from "./Types";

export class Keyboard {
  constructor(private win, private store: StageStore) {
    // events from inside the iframe
    this.unsubscribeAll.push(
      addEvent(window, "keydown", (e: KeyboardEvent) => this.onKeyDown(e)),
      addEvent(win, "keydown", (e: KeyboardEvent) => this.onKeyDown(e)),
    );
  }

  private unsubscribeAll: Array<() => void> = [];
  cleanup() {
    this.unsubscribeAll.forEach(u => u());
  }

  /**
   * handle shortcuts
   */
  private onKeyDown(e: KeyboardEvent) {
    const key = e.key;
    const state = this.store.getState();
    if(state.ui.catchingEvents) {
      switch(key) {
        case 'Escape':
          if(state.ui.mode !== UiMode.NONE) {
            this.store.dispatch(setMode(UiMode.NONE));
            this.store.dispatch(reset());
          }
          e.preventDefault();
          break;
        case 'Enter':
          if(state.ui.mode !== UiMode.EDIT && state.selectables.filter(s => s.selected).length > 0) {
            this.store.dispatch(setMode(UiMode.EDIT));
          }
          e.preventDefault();
          break;
        default:
      }
    }
    }
}