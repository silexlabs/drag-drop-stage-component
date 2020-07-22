import * as DomMetrics from '../utils/DomMetrics';
import {StageStore} from '../flux/StageStore';
import { SelectableState } from '../Types';
import * as types from '../Types';

/**
 * @class This class listens to the store
 *   and apply the state changes to the DOM elements
 */
export class SelectablesObserver {
  constructor(private stageDocument: HTMLDocument, private overlayDocument: HTMLDocument, private store: StageStore, private hooks: types.Hooks) {
    this.unsubscribeAll.push(
      store.subscribe(
        (state: Array<SelectableState>, prevState: Array<SelectableState>) => this.onStateChanged(state, prevState),
        (state:types.State) => state.selectables
      ),
      store.subscribe(
        (state: types.UiState, prevState: types.UiState) => this.onUiChanged(state),
        (state:types.State) => state.ui
      ),
    );
  }

  private isRefreshing: boolean = false;
  onUiChanged(state: types.UiState) {
    this.isRefreshing = state.refreshing;
  }

  private unsubscribeAll: Array<() => void> = [];
  cleanup() {
    this.unsubscribeAll.forEach(u => u());
  }

  /**
   * handle state changes, detect changes of scroll or metrics or selection
   * @param {State} state
   * @param {State} prevState the old state obj
   */
  onStateChanged(state: Array<SelectableState>, prevState: Array<SelectableState>) {
    // select selectables which have changed
    const filterBy = (propName, selectable) => {
      const oldSelectable = prevState.find(old => selectable.el === old.el);
      // FIXME: use JSON.stringify to compare?
      return !oldSelectable || JSON.stringify(oldSelectable[propName]) !== JSON.stringify(selectable[propName]);
      // return !oldSelectable || oldSelectable[propName] !== selectable[propName];
    }

    const removed = prevState.filter(s => !state.find(s2 => s2.el === s.el));
    const metrics = state.filter(selectable => filterBy('metrics', selectable));
    if(removed.length + metrics.length > 0) this.onMetrics(metrics, removed);

    const selection = state.filter(selectable => filterBy('selected', selectable));
    if(selection.length > 0) this.onSelection(selection);

    // const draggable = state.filter(selectable => filterBy('draggable', selectable));
    // if(draggable.length > 0) this.onDraggable(draggable);

    // const resizeable = state.filter(selectable => filterBy('resizeable', selectable));
    // if(resizeable.length > 0) this.onResizeable(resizeable);

    // const isDropZone = state.filter(selectable => filterBy('isDropZone', selectable));
    // if(isDropZone.length > 0) this.onDropZone(isDropZone);

    const translation = state.filter(selectable => filterBy('translation', selectable));
    if(translation.length > 0) this.onTranslation(translation);
  }
  // update elements position and size
  onMetrics(selectables: Array<SelectableState>, removed: Array<SelectableState>) {
    if(!this.isRefreshing) {
      selectables.forEach(selectable => {
        // while being dragged, elements are out of the flow, do not apply styles
        if(!selectable.preventMetrics) {
          DomMetrics.setMetrics(selectable.el, selectable.metrics, selectable.useMinHeight);
        }
      });
      // notify the app
      if(this.hooks.onChange) this.hooks.onChange(selectables.concat(removed));
    }
  }
  onSelection(selectables: Array<SelectableState>) {
    // notify the app
    if(this.hooks.onSelect) this.hooks.onSelect(selectables);
  }
  // onDraggable(selectables: Array<SelectableState>) {}
  // onResizeable(selectables: Array<SelectableState>) {}
  // onDropZone(selectables: Array<SelectableState>) {}
  onTranslation(selectables: Array<SelectableState>) {
    selectables.forEach(selectable => {
      if(!!selectable.translation) {
        selectable.el.style.transform = `translate(${selectable.translation.x}px, ${selectable.translation.y}px)`;
        selectable.el.style.zIndex = '99999999';
        if(selectable.metrics.position === 'static') {
          selectable.el.style.top = '0';
          selectable.el.style.left = '0';
          selectable.el.style.position = 'relative';
        }
      }
      else {
        selectable.el.style.transform = '';
        selectable.el.style.zIndex = '';
        selectable.el.style.position = '';
      }
    });
  }
}
