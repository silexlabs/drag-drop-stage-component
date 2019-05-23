import {StageStore} from './flux/StageStore';
import { SelectableState, State, MouseState, MouseData, ScrollData, ElementMetrics, UiState, UiMode } from './Types';
import { addEvent } from './utils/Events';
import * as DomMetrics from './utils/DomMetrics';

interface Box {
  selectable: SelectableState;
  ui: HTMLElement;
}

export class Ui {
  boxes: Array<Box> = [];

  static async createUi(iframe: HTMLIFrameElement, store: StageStore): Promise<Ui> {
    return new Promise<Ui>((resolve, reject) => {
      const doc = DomMetrics.getDocument(iframe);

      const overlay = doc.createElement('iframe');
      doc.body.appendChild(overlay);

      if(overlay.contentDocument.readyState === 'complete') {
        // chrome
        resolve(new Ui(iframe, overlay, store));
      }
      else {
        // firefox
        overlay.contentWindow.onload = () => {
          resolve(new Ui(iframe, overlay, store));
        }
      }
    });
  }

  private constructor(private iframe: HTMLIFrameElement, public overlay: HTMLIFrameElement, private store: StageStore) {
    // listen to events
    this.unsubscribeAll.push(
      // addEvent(win, 'resize', () => this.resizeOverlay()),
      addEvent(window, 'resize', () => this.resizeOverlay()),
      store.subscribe(
        (selectables: Array<SelectableState>) => this.update(selectables, this.getScrollData(iframe)),
        (state: State) => state.selectables,
      ),
      store.subscribe(
        (state: MouseState, prevState: MouseState) => this.onMouseChanged(state, prevState),
        (state:State) => state.mouse
      ),
      store.subscribe(
        (state: UiState, prevState: UiState) => this.onUiChanged(state, prevState),
        (state:State) => state.ui
      ),
    );

    // init iframes
    this.resizeOverlay();
    this.overlay.contentDocument.body.style.overflow = 'auto';
    iframe.contentDocument.body.style.overflow = 'scroll'; // FIXME: this could be a problem if saved with the site, what other solution?

    // add UI styles
    this.overlay.contentDocument.head.innerHTML = `
      <style>
        body {
          overflow: scroll;
          margin: -5px;
        }

        body.dragging-mode .box.not-selected,
        body.resizing-mode .box.not-selected { display: none; }

        .selected.box, .box:hover {
          border: 1px solid rgba(0, 0, 0, .5);
        }
        .selected.box:before,
        .box:hover:before {
          content: ' ';
          position: absolute;
          z-index: -1;
          top: 1px;
          left: 1px;
          right: 1px;
          bottom: 1px;
          border: 1px solid rgba(255, 255, 255, .3);
        }
        .not-selectable,
        .not-selected .handle { display: none; }

        .handle {
          position: absolute;
          border: 1px solid rgba(0, 0, 0, .5);
          background-color: rgba(255, 255, 255, 1);
          width: 5px;
          height: 5px;
          border-radius: 2.5px;
        }
        .handle-nw { top: -4px; left: -4px; }
        .not-resizeable-nw .handle-nw { display: none; }

        .handle-ne { top: -4px; right: -4px; }
        .not-resizeable-ne .handle-ne { display: none; }

        .handle-sw { bottom: -4px; left: -4px; }
        .not-resizeable-sw .handle-sw { display: none; }

        .handle-se { bottom: -4px; right: -4px; }
        .not-resizeable-se .handle-se { display: none; }

        .region-marker {
          background-color: rgba(0, 0, 0, .1);
          border: 1px solid rgba(255, 255, 255, .5);
          display: flex;
          position: absolute;
          left: 0;
          top: 0;
          min-width: 1px;
          min-height: 1px;
        }

        .stycky-left { border-left-color: red !important; }
        .stycky-top { border-top-color: red !important; }
        .stycky-right { border-right-color: red !important; }
        .stycky-bottom { border-bottom-color: red !important; }
    `;
  }

  resizeOverlay() {
    this.resize()
    this.update(this.store.getState().selectables, this.getScrollData(this.iframe));
  }

  private unsubscribeAll: Array<() => void> = [];
  cleanup() {
    this.unsubscribeAll.forEach(u => u());
    this.overlay.parentElement.removeChild(this.overlay);
    this.overlay = null;
  }

  private getScrollData(iframe: HTMLIFrameElement): ScrollData {
    return {
      x: iframe.contentWindow.document.scrollingElement.scrollWidth,
      y: iframe.contentWindow.document.scrollingElement.scrollHeight,
    };
  }
  private resize() {
    const metrics = DomMetrics.getMetrics(this.iframe);
    const zIndex = this.iframe.contentWindow.getComputedStyle(this.iframe).getPropertyValue('z-index');
    metrics.position = 'absolute';
    DomMetrics.setMetrics(this.overlay, metrics, false, true);
    this.overlay.style.backgroundColor = 'transparent';
    this.overlay.style.zIndex = ((parseInt(zIndex) || 0) + 1).toString();
    this.overlay.style.border = 'none';
  }
  private onUiChanged(state: UiState, prevState: UiState) {
    if(state.catchingEvents !== prevState.catchingEvents || state.mode !== prevState.mode) {
      // this is to give the focus on the UI, and not prevent the user from pressing tab again
      this.overlay.style.pointerEvents = state.catchingEvents ? '' : 'none';

      if(state.mode === UiMode.HIDE) {
        this.overlay.style.top = "-999999px";
        this.overlay.style.left = "-999999px";
        this.overlay.style.width = "0";
        this.overlay.style.height = "0";
      }
      else {
        this.resizeOverlay();
      }
    }
  }
  private onMouseChanged(state: MouseState, prevState: MouseState) {
    if(state.scrollData.x !== prevState.scrollData.x || state.scrollData.y !== prevState.scrollData.y) {
      DomMetrics.setScroll(this.overlay.contentDocument, state.scrollData);

      // adjust scroll - sometimes there is a 1px difference because of the border of the UI
      if(this.store.getState().ui.mode !== UiMode.HIDE) {
        DomMetrics.setScroll(this.iframe.contentDocument, state.scrollData);
        const newScrollData = DomMetrics.getScroll(this.iframe.contentDocument);
        if(state.scrollData.x !== newScrollData.x || state.scrollData.y !== newScrollData.y) {
          // there is a delta in scroll
          DomMetrics.setScroll(this.overlay.contentDocument, newScrollData);
        }
      }
    }
    if(state.cursorData.cursorType !== prevState.cursorData.cursorType) {
      this.overlay.contentDocument.body.style.cursor = state.cursorData.cursorType;
    }
  }

  update(selectables: Array<SelectableState>, scrollData: ScrollData) {
    //  update scroll
    this.overlay.contentDocument.body.style.width = scrollData.x + 'px';
    this.overlay.contentDocument.body.style.height = scrollData.y + 'px';

    // remove the UIs that have no corresponding element in the stage
    this.boxes
    .filter(r => !selectables.find(s => r.selectable.el === s.el))
    .forEach(r => r.ui.parentElement.removeChild(r.ui));

    // remove the boxes
    this.boxes = this.boxes
    .filter(r => selectables.find(s => r.selectable.el === s.el))

    // add the missing boxes
    this.boxes = this.boxes.concat(
      selectables
      // only the missing ones
      .filter(s => !this.boxes.find(r => r.selectable.el === s.el))
      // create a box object
      .map(s => ({
        selectable: s,
        // append a new div to the overlay
        ui: this.overlay.contentDocument.body.appendChild(this.createBoxUi()),
      }))
    );

    // update the view
    this.boxes.map(r => this.updateBox(r, selectables.find(s => s.el === r.selectable.el)));
  }
  private createBoxUi(): HTMLElement {
    const box = this.overlay.contentDocument.createElement('div');
    box.innerHTML = `
      <div class='handle handle-nw'></div>
      <div class='handle handle-ne'></div>
      <div class='handle handle-sw'></div>
      <div class='handle handle-se'></div>
    `;
    return box;
  }
  private updateBox(box: Box, selectable: SelectableState): Box {
    const sticky = selectable.selected ? this.store.getState().ui.sticky : {top: null, left: null, bottom: null, right: null};

    box.selectable = selectable;
    DomMetrics.setMetrics(box.ui, {
      ...box.selectable.metrics,
      position: 'absolute',
      padding: {top: 0, left: 0, bottom: 0, right: 0},
      margin: {top: 0, left: 0, bottom: 0, right: 0},
      border: {top: 1, left: 1, bottom: 1, right: 1},
    }, false, true);
    box.ui.classList.remove(...[
      !box.selectable.selected ? 'selected' : 'not-selected',
      !box.selectable.selectable ? 'selectable' : 'not-selectable',
      !box.selectable.draggable ? 'draggable' : 'not-draggable',
      (!box.selectable.resizeable.top && !box.selectable.resizeable.left) ? 'resizeable-nw' : 'not-resizeable-nw',
      (!box.selectable.resizeable.top && !box.selectable.resizeable.right) ? 'resizeable-ne' : 'not-resizeable-ne',
      (!box.selectable.resizeable.bottom && !box.selectable.resizeable.left) ? 'resizeable-sw' : 'not-resizeable-sw',
      (!box.selectable.resizeable.bottom && !box.selectable.resizeable.right) ? 'resizeable-se' : 'not-resizeable-se',
      !box.selectable.isDropZone ? 'isDropZone' : 'not-isDropZone',
      !sticky.left ? 'stycky-left' : 'not-stycky-left',
      !sticky.top ? 'stycky-top' : 'not-stycky-top',
      !sticky.right ? 'stycky-right' : 'not-stycky-right',
      !sticky.bottom ? 'stycky-bottom' : 'not-stycky-bottom',
    ]);
    box.ui.classList.add(...[
      'box',
      box.selectable.selected ? 'selected' : 'not-selected',
      box.selectable.selectable ? 'selectable' : 'not-selectable',
      box.selectable.draggable ? 'draggable' : 'not-draggable',
      (box.selectable.resizeable.top && box.selectable.resizeable.left) ? 'resizeable-nw' : 'not-resizeable-nw',
      (box.selectable.resizeable.top && box.selectable.resizeable.right) ? 'resizeable-ne' : 'not-resizeable-ne',
      (box.selectable.resizeable.bottom && box.selectable.resizeable.left) ? 'resizeable-sw' : 'not-resizeable-sw',
      (box.selectable.resizeable.bottom && box.selectable.resizeable.right) ? 'resizeable-se' : 'not-resizeable-se',
      box.selectable.isDropZone ? 'isDropZone' : 'not-isDropZone',
      sticky.left ? 'stycky-left' : 'not-stycky-left',
      sticky.top ? 'stycky-top' : 'not-stycky-top',
      sticky.right ? 'stycky-right' : 'not-stycky-right',
      sticky.bottom ? 'stycky-bottom' : 'not-stycky-bottom',
    ]);
    return box;
  }
}
