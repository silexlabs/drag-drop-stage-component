import {StageStore} from './flux/StageStore';
import { SelectableState, State, MouseState, MouseData, ScrollData, ElementMetrics } from './Types';
import { addEvent } from './utils/Events';
import * as DomMetrics from './utils/DomMetrics';

interface Box {
  selectable: SelectableState;
  ui: HTMLElement;
}

export class Ui {

  overlay: HTMLIFrameElement;
  boxes: Array<Box> = [];

  constructor(iframe: HTMLIFrameElement, store: StageStore) {
    const doc = DomMetrics.getDocument(iframe);
    const win = DomMetrics.getWindow(doc);

    // create the overlay
    doc.body.style.overflow = 'hidden';
    if(!!this.overlay && !!this.overlay.parentElement) {
      this.overlay.parentElement.removeChild(this.overlay); // could use less supported this.overlay.remove()
    }
    this.overlay = doc.createElement('iframe');
    doc.body.appendChild(this.overlay);

    // init iframe
    this.resize(DomMetrics.getBoundingBoxDocument(iframe), win.getComputedStyle(iframe).zIndex);
    this.update(store.getState().selectables, this.getScrollData(iframe));

    // overlay content
    this.overlay.contentDocument.head.innerHTML = `
      <style>
        body {
          overflow: hidden;
          margin: -5px;
        }

        body.dragging-mode .box.not-selected,
        body.resizing-mode .box.not-selected { display: none; }

        .selected.box, .box:hover {
          border: 1px solid rgba(0, 0, 0, .5);
        }
        .selected.box:before,
        .box:hover:before {
          content: " ";
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
    `;
    this.unsubscribeAll.push(
      addEvent(win, 'resize', () => {
        this.resize(DomMetrics.getBoundingBoxDocument(iframe), win.getComputedStyle(iframe).zIndex)
        this.update(store.getState().selectables, this.getScrollData(iframe));
      }),
      store.subscribe(
        (selectables: Array<SelectableState>) => this.update(selectables, this.getScrollData(iframe)),
        (state: State) => state.selectables,
      ),
      store.subscribe(
        (state: MouseState, prevState: MouseState) => this.onMouseChanged(state, prevState),
        (state:State) => state.mouse
      ),
    );
  }

  private unsubscribeAll: Array<() => void> = [];
  cleanup() {
    this.unsubscribeAll.forEach(u => u());
  }

  private getScrollData(iframe: HTMLIFrameElement): ScrollData {
    return {
      x: iframe.contentWindow.document.scrollingElement.scrollWidth,
      y: iframe.contentWindow.document.scrollingElement.scrollHeight,
    };
  }
  private resize(bb: ClientRect, zIndex: string) {
    this.overlay.style.border = 'none';
    this.overlay.style.zIndex = ((parseInt(zIndex) || 0) + 1).toString();
    this.overlay.style.backgroundColor = 'transparent';
    this.overlay.style.position = 'absolute';
    this.overlay.style.top = bb.top + 'px';
    this.overlay.style.left = bb.left + 'px';
    this.overlay.style.width = bb.width + 'px';
    this.overlay.style.height = bb.height + 'px';
  }
  onMouseChanged(state: MouseState, prevState: MouseState) {
    if(state.scrollData.x !== prevState.scrollData.x || state.scrollData.y !== prevState.scrollData.y) {
      DomMetrics.setScroll(this.overlay.contentDocument, state.scrollData);
    }
    if(state.cursorData.cursorType !== prevState.cursorData.cursorType) {
      this.overlay.contentDocument.body.style.cursor = state.cursorData.cursorType;
    }
  }
  update(selectables: Array<SelectableState>, scrollData: ScrollData) {
    //  update scroll
    this.overlay.contentDocument.body.style.overflow = 'auto';
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
  createBoxUi(): HTMLElement {
    const box = this.overlay.contentDocument.createElement('div');
    box.innerHTML = `
      <div class="handle handle-nw"></div>
      <div class="handle handle-ne"></div>
      <div class="handle handle-sw"></div>
      <div class="handle handle-se"></div>
    `;
    return box;
  }
  updateBox(box: Box, selectable: SelectableState): Box {
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
    ]);
    return box;
  }
}