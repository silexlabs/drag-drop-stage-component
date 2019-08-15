import { StageStore } from './flux/StageStore';
import { addEvent } from './utils/Events';
import { setMode } from './flux/UiState';
import { reset } from './flux/SelectionState';
import { UiMode, Hooks } from './Types';
import { updateSelectables } from './flux/SelectableState';
import * as DomMetrics from './utils/DomMetrics';

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
    const updated = this.store.getState().selectables
    .filter(s => s.selected && this.hooks.isDraggable(s.el))
    .map(selectable => {
      if(selectable.metrics.position === 'static') {
        // move the element in the dom
        const element = selectable.el;
        if((movementX < 0 || movementY < 0) && element.previousElementSibling) {
          element.parentNode.insertBefore(element, element.previousElementSibling);
        }
        else if((movementX > 0 || movementY > 0) && element.nextElementSibling) {
          element.parentNode.insertBefore(element.nextElementSibling, element);
        }
        else {
          // nothing happened
          return null;
        }
        selectable.dropZone = {
          parent: element.parentNode as HTMLElement,
        };
        return {
          ...selectable,
          metrics: DomMetrics.getMetrics(selectable.el),
        };
      }
      return {
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
      };
    })
    .filter(s => !!s);
    this.store.dispatch(updateSelectables(updated));
    const domChanged = updated.filter(s => !!s.dropZone);
    if(domChanged.length > 0) {
      if(this.hooks.onDrop) this.hooks.onDrop(domChanged);
    }
  }
}
