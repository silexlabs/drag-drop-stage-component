import * as DomMetrics from '../utils/DomMetrics';
import {StageStore} from '../flux/StageStore';
import { SelectableState } from '../Types';
import * as types from '../Types';
import { MouseHandlerBase } from '../handlers/MouseHandlerBase';

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

    const dropping = state.filter(selectable => filterBy('dropping', selectable));
    if(dropping.length > 0) this.onDropping(dropping);
  }
  // update elements position and size
  // TODO: ?? update element container: change container or the container size
  // TODO: ?? add or remove elements
  onMetrics(selectables) {
    selectables.forEach(selectable => {
      DomMetrics.setMetrics(selectable.el, selectable.metrics);
    });
  }
  onSelection(selectables) {
    selectables.forEach(selectable => selectable.selected ?
      selectable.el.classList.add('selected') :
      selectable.el.classList.remove('selected'))
  }
  onDraggable(selectables) {
    selectables.forEach(selectable => selectable.draggable ?
      selectable.el.classList.add('draggable') :
      selectable.el.classList.remove('draggable'))
  }
  onResizeable(selectables) {
    selectables.forEach(selectable => selectable.resizeable ?
      selectable.el.classList.add('resizeable') :
      selectable.el.classList.remove('resizeable'))
  }
  onDropZone(selectables) {
    selectables.forEach(selectable => selectable.isDropZone ?
      selectable.el.classList.add('isDropZone') :
      selectable.el.classList.remove('isDropZone'))
  }
  onDropping(selectables) {
    selectables.forEach(selectable => selectable.dropping ?
      selectable.el.classList.add('dropping') :
      selectable.el.classList.remove('dropping'))
  }
}