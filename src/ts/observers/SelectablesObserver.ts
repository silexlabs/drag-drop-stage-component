import * as DomMetrics from '../utils/DomMetrics';
import {StageStore} from '../flux/StageStore';
import { SelectableState } from '../Types';
import * as types from '../Types';

/**
 * @class This class listens to the store
 *   and apply the state changes to the DOM elements
 */
export class SelectablesObserver {
  constructor(private doc: HTMLDocument, store: StageStore, private hooks: types.Hooks) {
    store.subscribe(
      (state: Array<SelectableState>, prevState: Array<SelectableState>) => this.onStateChanged(state, prevState),
      (state:types.State) => state.selectables
    )
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
      // return !oldSelectable || JSON.stringify(oldSelectable[propName]) !== JSON.stringify(selectable[propName]);
      return !oldSelectable || oldSelectable[propName] !== selectable[propName];
    }
    const metrics = state.filter(selectable => filterBy('metrics', selectable));
    if(metrics.length > 0) this.onMetrics(metrics);

    const selection = state.filter(selectable => filterBy('selected', selectable));
    if(selection.length > 0) this.onSelection(selection);

    const draggable = state.filter(selectable => filterBy('draggable', selectable));
    if(draggable.length > 0) this.onDraggable(draggable);

    const resizeable = state.filter(selectable => filterBy('resizeable', selectable));
    if(resizeable.length > 0) this.onResizeable(resizeable);

    const isDropZone = state.filter(selectable => filterBy('isDropZone', selectable));
    if(isDropZone.length > 0) this.onDropZone(isDropZone);

    const translation = state.filter(selectable => filterBy('translation', selectable));
    if(translation.length > 0) this.onTranslation(translation);
  }
  // update elements position and size
  onMetrics(selectables: Array<SelectableState>) {
    selectables.forEach(selectable => {
      // while being dragged, elements are out of the flow, do not apply styles
      if(!selectable.preventMetrics) {
        DomMetrics.setMetrics(selectable.el, selectable.useMinHeight, selectable.metrics);
      }
    });
  }
  onSelection(selectables: Array<SelectableState>) {
    selectables.forEach(selectable => selectable.selected ?
      selectable.el.classList.add('selected') :
      selectable.el.classList.remove('selected'));
    if(this.hooks.onSelect) this.hooks.onSelect(selectables);
  }
  onDraggable(selectables: Array<SelectableState>) {
    selectables.forEach(selectable => selectable.draggable ?
      selectable.el.classList.add('draggable') :
      selectable.el.classList.remove('draggable'));
  }
  onResizeable(selectables: Array<SelectableState>) {
    selectables.forEach(selectable => selectable.resizeable ?
      selectable.el.classList.add('resizeable') :
      selectable.el.classList.remove('resizeable'));
  }
  onDropZone(selectables: Array<SelectableState>) {
    selectables.forEach(selectable => selectable.isDropZone ?
      selectable.el.classList.add('isDropZone') :
      selectable.el.classList.remove('isDropZone'));
  }
  onTranslation(selectables: Array<SelectableState>) {
    selectables.forEach(selectable => {
      if(!!selectable.translation) {
        selectable.el.style.transform = `translate(${selectable.translation.x}px, ${selectable.translation.y}px)`;
        selectable.el.style.zIndex = '99999999';
        if(selectable.metrics.position === 'static') {
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