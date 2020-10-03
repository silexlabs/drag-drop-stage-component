import {StageStore} from '../flux/StageStore';
import { SelectableState } from '../Types';
import * as types from '../Types';

declare class ResizeObserver {
  constructor(onChanged: any);
  observe: any;
  disconnect: any;
  takeRecords: any;
};

// dom observers instances, exposed for unit tests
export const domObservers = new Map<HTMLElement, {mutationObserver: MutationObserver, resizeObserver: ResizeObserver}>();
export function initDomObservers(elements, onChanged) {
  resetDomObservers();
  elements.forEach((el) => addDomObserver(el, onChanged));
};

export function resetDomObservers() {
  Array.from(domObservers.keys())
  .forEach((el) => removeDomObserver(el));
};

export function addDomObserver(el: HTMLElement, onChanged: (entries: Array<any>) => void) {
  if (typeof ResizeObserver === 'undefined') {
    throw new Error('ResizeObserver is not supported by your browser. The drag and drop features will not work properly');
  }
  if (domObservers.has(el)) {
    removeDomObserver(el);
  }
  const resizeObserver = new ResizeObserver(onChanged);
  resizeObserver.observe(el, {});

  const mutationObserver = new MutationObserver(onChanged);
  // FIXME: mutation observer is disabled => remove useless mutationObserver
  // mutationObserver.observe(el, {
  //   subtree: true,
  //   childList: true,
  //   attributes: true,
  //   attributeOldValue: false,
  //   characterData: true,
  //   characterDataOldValue: false,
  // });

  domObservers.set(el, {mutationObserver, resizeObserver});
};

export function removeDomObserver(el: HTMLElement) {
  if (domObservers.has(el)) {
    const {mutationObserver, resizeObserver} = domObservers.get(el);
    resizeObserver.disconnect();
    mutationObserver.disconnect();
    mutationObserver.takeRecords();
    domObservers.delete(el);
  } else {
    throw new Error('DOM observer not found for this DOM element');
  }
};

/**
 * @class This class listens to the store
 *   and observe the dom elements in order to keep the metrics in sync
 *   using MutationObserver and ResizeObserver APIs of the browser
 */
export class DomObserver {
  constructor(store: StageStore, private cbk: (state: SelectableState, entries: Array<any>) => void) {
    this.unsubscribeAll.push(
      store.subscribe(
        (state: Array<SelectableState>, prevState: Array<SelectableState>) => this.onStateChanged(state, prevState),
        (state:types.State) => state.selectables
      ),
      store.subscribe(
        (state: types.UiState, prevState: types.UiState) => this.onUiChanged(state, prevState),
        (state:types.State) => state.ui
      ),
    );
  }

  private isRefreshing: boolean = false;
  private state: Array<SelectableState> = []
  private prevState: Array<SelectableState> = []
  onUiChanged(state: types.UiState, prevState: types.UiState) {
    this.isRefreshing = state.refreshing;
    // // update after refresh (bug because isRefreshing is turned on and off many times)
    // if (state.refreshing !== prevState.refreshing && state.refreshing === false) {
    //   this.onStateChanged()
    // }
  }

  private unsubscribeAll: Array<() => void> = [];
  cleanup() {
    this.unsubscribeAll.forEach(u => u());
    resetDomObservers();
  }

  onRemoved(state: SelectableState) {
    removeDomObserver(state.el);
  }

  onAdded(state: SelectableState) {
    addDomObserver(state.el, (entries) => this.onChanged(state, entries));
  }

  onChanged(state: SelectableState, entries) {
    this.cbk(state, entries);
  }

  /**
   * handle state changes, detect changes of scroll or metrics or selection
   * @param {State} state
   * @param {State} prevState the old state obj
   */
  onStateChanged(state: Array<SelectableState> = this.state, prevState: Array<SelectableState> = this.prevState) {
    this.state = state
    if(!this.isRefreshing) {
      this.prevState = prevState
      const added = state.filter(s => !prevState.find(s2 => s2.el === s.el));
      added.forEach((state) => this.onAdded(state))

      const removed = prevState.filter(s => !state.find(s2 => s2.el === s.el));
      removed.forEach((state) => this.onRemoved(state))
    }
  }
}
