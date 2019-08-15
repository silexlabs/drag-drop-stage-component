import { StageStore } from './flux/StageStore';
import { addEvent } from './utils/Events';
import { setMode } from './flux/UiState';
import { reset } from './flux/SelectionState';
import { UiMode, Hooks } from './Types';
import { updateSelectables } from './flux/SelectableState';
import { SelectableState } from './Types';
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

  /**
   * function used to sort selectables before moving them
   * this groups them with the ones which are next to a selected element and the others
   * it is useful when moving multiple elements in the DOM
   */
  getDomMotionSort(selection: Array<SelectableState>, element: HTMLElement, movementX: number, movementY: number): number {
    const motion = this.getDomMotion(selection, element, movementX, movementY);
    return motion === 'up' ? -1
      : motion === 'down' ? 1
      : 0;
  }

  /**
   * get the motion an element is supposed to have in the dom
   * if the element is supposed to go up but has another selected element above it, it will not move
   * if an element is supposed to go up but it is the top element, it will not move
   * same rules for going down
   */
  getDomMotion(selection: Array<SelectableState>, element: HTMLElement, movementX: number, movementY: number): string {
    return (movementX > 0 || movementY > 0) && element.nextElementSibling && !selection.find(s => s.el === element.nextElementSibling) ? 'down'
      : (movementX < 0 || movementY < 0) && element.previousElementSibling && !selection.find(s => s.el === element.previousElementSibling) ? 'up'
      : '';
  }

  /**
   * move an element up, down, left, right
   * changes the top or left properties or the position in the dom
   * depending on the positionning of the element (static VS absolute/relative...)
   */
  move(movementX, movementY) {
    const selection = this.store.getState().selectables
    .filter(s => s.selected && this.hooks.isDraggable(s.el));

    const updated = selection
    .sort((s1, s2) => this.getDomMotionSort(selection, s2.el, movementX, movementY) - this.getDomMotionSort(selection, s1.el, movementX, movementY))
    .map(selectable => {
      if(selectable.metrics.position === 'static') {
        // move the element in the dom
        const element = selectable.el;
        switch(this.getDomMotion(selection, element, movementX, movementY)) {
          case 'up':
            element.parentNode.insertBefore(element, element.previousElementSibling);
            break;
          case 'down':
            element.parentNode.insertBefore(element.nextElementSibling, element);
            break;
          default:
            // nothing happened
            return null;
        }
        // element was moved in the dom => update metrics
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
