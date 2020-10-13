import { StageStore } from './flux/StageStore';
import { addEvent } from './utils/Events';
import { setMode } from './flux/UiState';
import { reset } from './flux/SelectionState';
import { UiMode, Hooks } from './Types';

export class Keyboard {
  constructor(private win: Window, private store: StageStore, private hooks: Hooks) {
    // events from inside the iframe
    this.unsubscribeAll.push(
      addEvent(window, 'keydown', (e: KeyboardEvent) => this.onKeyDown(e)),
      addEvent(win, 'keydown', (e: KeyboardEvent) => this.onKeyDown(e)),
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
    const target = e.target as HTMLElement;

    if(state.ui.catchingEvents &&
      target.tagName.toLowerCase() !== 'input' &&
      target.tagName.toLowerCase() !== 'textarea' &&
      !target.hasAttribute('contenteditable')) {
      switch(key) {
        case 'Escape':
          if(state.ui.mode !== UiMode.NONE) {
            this.store.dispatch(setMode(UiMode.NONE));
            this.store.dispatch(reset());
          }
          break;
        case 'Enter':
          if(this.hooks.onEdit) this.hooks.onEdit();
          break;
        default:
          return;
      }
      // only if we catched a shortcut
      e.preventDefault();
      e.stopPropagation();
    }
  }
}
