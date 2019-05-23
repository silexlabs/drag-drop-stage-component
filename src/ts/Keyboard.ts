import { StageStore } from './flux/StageStore';
import { addEvent } from './utils/Events';
import { setMode } from './flux/UiState';
import { reset } from './flux/SelectionState';
import { UiMode, Hooks } from './Types';
import { updateSelectables } from './flux/SelectableState';

const MOVE_DISTANCE = 5;
const SHIFT_MOVE_DISTANCE = 1;
const ALT_MOVE_DISTANCE = 10;

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
        case 'Tab':
          if(this.store.getState().ui.mode === UiMode.HIDE) {
            this.store.dispatch(setMode(UiMode.NONE));
          }
          else {
            this.store.dispatch(setMode(UiMode.HIDE));
          }
          break;
        case 'ArrowLeft':
          this.move(-this.getDistance(e), 0);
          break;
        case 'ArrowUp':
          this.move(0, -this.getDistance(e));
          break;
        case 'ArrowRight':
          this.move(this.getDistance(e), 0);
          break;
        case 'ArrowDown':
          this.move(0, this.getDistance(e));
          break;
        default:
          return;
      }
      // only if we catched a shortcut
      e.preventDefault();
      e.stopPropagation();
    }
  }
  getDistance(e: KeyboardEvent) {
    return e.shiftKey ? SHIFT_MOVE_DISTANCE :
      e.altKey ? ALT_MOVE_DISTANCE : MOVE_DISTANCE;
  }
  move(movementX, movementY) {
    this.store.dispatch(updateSelectables(
      this.store.getState().selectables
      .filter(s => s.selected && s.metrics.position !== 'static' && this.hooks.isDraggable(s.el))
      .map(selectable => ({
        ...selectable,
        metrics: {
          ...selectable.metrics,
          clientRect : {
            ...selectable.metrics.clientRect,
            top: selectable.metrics.clientRect.top + movementY,
            left: selectable.metrics.clientRect.left + movementX,
            bottom: selectable.metrics.clientRect.bottom + movementY,
            right: selectable.metrics.clientRect.right + movementX,
          },
          computedStyleRect: {
            ...selectable.metrics.computedStyleRect,
            top: selectable.metrics.computedStyleRect.top + movementY,
            left: selectable.metrics.computedStyleRect.left + movementX,
            bottom: selectable.metrics.computedStyleRect.bottom + movementY,
            right: selectable.metrics.computedStyleRect.right + movementX,
          },
        }
      }))
    ));
  }
}