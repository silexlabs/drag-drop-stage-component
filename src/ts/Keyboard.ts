import { StageStore } from "./flux/StageStore";
import { addEvent } from "./utils/Events";
import { setMode } from "./flux/UiState";
import { reset } from "./flux/SelectionState";
import { UiMode } from "./Types";

export class Keyboard {
  constructor(private win, private store: StageStore) {
    // events from inside the iframe
    this.unsubscribeAll.push(
      addEvent(window, "keydown", (e: KeyboardEvent) => this.onKeyDown(e.keyCode)),
      addEvent(win, "keydown", (e: KeyboardEvent) => this.onKeyDown(e.keyCode)),
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
    switch(key) {
      case 27:
        this.store.dispatch(setMode(UiMode.NONE));
        this.store.dispatch(reset());
        break;
      default:
    }
  }
}