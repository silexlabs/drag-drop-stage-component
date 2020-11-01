var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "./Types", "./utils/Events", "./utils/DomMetrics"], function (require, exports, Types_1, Events_1, DomMetrics) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Ui = void 0;
    class Ui {
        constructor(iframe, overlay, store) {
            this.iframe = iframe;
            this.overlay = overlay;
            this.store = store;
            this.boxes = [];
            this.unsubscribeAll = [];
            this.isRefreshing = false;
            // listen to events
            this.unsubscribeAll.push(
            // addEvent(win, 'resize', () => this.resizeOverlay()),
            Events_1.addEvent(window, 'resize', () => this.resizeOverlay()), store.subscribe((selectables) => this.update(selectables), (state) => state.selectables), store.subscribe((state, prevState) => this.onMouseChanged(state, prevState), (state) => state.mouse), store.subscribe((state, prevState) => this.onUiChanged(state, prevState), (state) => state.ui));
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

        body.dragging-mode .box.not-selected.not-aboutToDrop,
        body.resizing-mode .box.not-selected { display: none; }

        .aboutToDrop, .selected.box, .box.target {
          border: 1px solid rgba(0, 0, 0, .5);
        }
        .box.aboutToDrop:before,
        .box.selected:before,
        .box.target:before {
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
          z-index: 999;
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
        static createUi(iframe, store) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => {
                    const doc = DomMetrics.getDocument(iframe);
                    const overlay = doc.createElement('iframe');
                    doc.body.appendChild(overlay);
                    if (overlay.contentDocument.readyState === 'complete') {
                        // chrome
                        resolve(new Ui(iframe, overlay, store));
                    }
                    else {
                        // firefox
                        overlay.contentWindow.onload = () => {
                            resolve(new Ui(iframe, overlay, store));
                        };
                    }
                });
            });
        }
        resizeOverlay() {
            this.resize();
        }
        cleanup() {
            this.unsubscribeAll.forEach(u => u());
            this.overlay.parentElement.removeChild(this.overlay);
            this.overlay = null;
        }
        // private getScrollData(iframe: HTMLIFrameElement): ScrollData {
        //   return {
        //     x: iframe.contentWindow.document.scrollingElement.scrollWidth,
        //     y: iframe.contentWindow.document.scrollingElement.scrollHeight,
        //   };
        // }
        resize() {
            const metrics = DomMetrics.getMetrics(this.iframe);
            const zIndex = this.iframe.contentWindow.getComputedStyle(this.iframe).getPropertyValue('z-index');
            metrics.position = 'absolute';
            DomMetrics.setMetrics(this.overlay, metrics, false, true);
            this.overlay.style.backgroundColor = 'transparent';
            this.overlay.style.zIndex = ((parseInt(zIndex) || 0) + 1).toString();
            this.overlay.style.border = 'none';
        }
        onUiChanged(state, prevState) {
            this.isRefreshing = state.refreshing;
            // // update after refresh (fail because isRefreshing is turned on and off many times)
            // if (state.refreshing !== prevState.refreshing && state.refreshing === false) {
            //   this.update(this.store.getState().selectables)
            // }
            if (state.catchingEvents !== prevState.catchingEvents || state.mode !== prevState.mode) {
                // this is to give the focus on the UI, and not prevent the user from pressing tab again
                this.overlay.style.pointerEvents = state.catchingEvents ? '' : 'none';
                if (state.mode === Types_1.UiMode.HIDE) {
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
        onMouseChanged(state, prevState) {
            if (state.scrollData.x !== prevState.scrollData.x || state.scrollData.y !== prevState.scrollData.y) {
                DomMetrics.setScroll(this.overlay.contentDocument, state.scrollData);
                // adjust scroll - sometimes there is a 1px difference because of the border of the UI
                if (this.store.getState().ui.mode !== Types_1.UiMode.HIDE) {
                    DomMetrics.setScroll(this.iframe.contentDocument, state.scrollData);
                    const newScrollData = DomMetrics.getScroll(this.iframe.contentDocument);
                    if (state.scrollData.x !== newScrollData.x || state.scrollData.y !== newScrollData.y) {
                        // there is a delta in scroll
                        DomMetrics.setScroll(this.overlay.contentDocument, newScrollData);
                    }
                }
            }
            if (state.cursorData.cursorType !== prevState.cursorData.cursorType) {
                this.overlay.contentDocument.body.style.cursor = state.cursorData.cursorType;
            }
        }
        update(selectables) {
            if (!this.isRefreshing) {
                //  update scroll
                const { scrollWidth, scrollHeight } = this.iframe.contentWindow.document.scrollingElement;
                this.overlay.contentDocument.body.style.width = scrollWidth + 'px';
                this.overlay.contentDocument.body.style.height = scrollHeight + 'px';
                // remove the UIs that have no corresponding element in the stage
                this.boxes
                    .filter(r => !selectables.find(s => r.selectable.el === s.el))
                    .forEach(r => r.ui.parentElement.removeChild(r.ui));
                // remove the boxes
                this.boxes = this.boxes
                    .filter(r => selectables.find(s => r.selectable.el === s.el));
                // add the missing boxes
                this.boxes = this.boxes.concat(selectables
                    // only the missing ones
                    .filter(s => !this.boxes.find(r => r.selectable.el === s.el))
                    // create a box object
                    .map(s => ({
                    selectable: s,
                    // append a new div to the overlay
                    ui: this.overlay.contentDocument.body.appendChild(this.createBoxUi()),
                })));
                // update the view
                const mode = this.store.getState().ui.mode;
                const dropZones = mode === Types_1.UiMode.DRAG ? selectables.filter(s => s.dropZone && s.dropZone.parent).map(s => s.dropZone.parent)
                    : [];
                this.boxes
                    .map(r => this.updateBox(r, selectables.find(s => s.el === r.selectable.el), dropZones));
            }
        }
        createBoxUi() {
            const box = this.overlay.contentDocument.createElement('div');
            box.innerHTML = `
      <div class='handle handle-nw'></div>
      <div class='handle handle-ne'></div>
      <div class='handle handle-sw'></div>
      <div class='handle handle-se'></div>
    `;
            return box;
        }
        updateBox(box, selectable, dropZones) {
            const sticky = selectable.selected ? this.store.getState().ui.sticky : { top: null, left: null, bottom: null, right: null };
            const aboutToDrop = !!dropZones.find(el => el === selectable.el);
            const target = this.store.getState().mouse.mouseData.target === box.selectable.el;
            box.selectable = selectable;
            DomMetrics.setMetrics(box.ui, Object.assign(Object.assign({}, box.selectable.metrics), { position: 'absolute', padding: { top: 0, left: 0, bottom: 0, right: 0 }, margin: { top: 0, left: 0, bottom: 0, right: 0 }, border: { top: 1, left: 1, bottom: 1, right: 1 } }), false, true);
            box.ui.classList.remove(...[
                !box.selectable.selected ? 'selected' : 'not-selected',
                !box.selectable.selectable ? 'selectable' : 'not-selectable',
                !box.selectable.draggable ? 'draggable' : 'not-draggable',
                !box.selectable.hovered ? 'hover' : 'not-hover',
                !target ? 'target' : 'not-target',
                (!box.selectable.resizeable.top && !box.selectable.resizeable.left) ? 'resizeable-nw' : 'not-resizeable-nw',
                (!box.selectable.resizeable.top && !box.selectable.resizeable.right) ? 'resizeable-ne' : 'not-resizeable-ne',
                (!box.selectable.resizeable.bottom && !box.selectable.resizeable.left) ? 'resizeable-sw' : 'not-resizeable-sw',
                (!box.selectable.resizeable.bottom && !box.selectable.resizeable.right) ? 'resizeable-se' : 'not-resizeable-se',
                !box.selectable.isDropZone ? 'isDropZone' : 'not-isDropZone',
                !sticky.left ? 'stycky-left' : 'not-stycky-left',
                !sticky.top ? 'stycky-top' : 'not-stycky-top',
                !sticky.right ? 'stycky-right' : 'not-stycky-right',
                !sticky.bottom ? 'stycky-bottom' : 'not-stycky-bottom',
                !aboutToDrop ? 'aboutToDrop' : 'not-aboutToDrop',
            ]);
            box.ui.classList.add(...[
                'box',
                box.selectable.selected ? 'selected' : 'not-selected',
                box.selectable.selectable ? 'selectable' : 'not-selectable',
                box.selectable.draggable ? 'draggable' : 'not-draggable',
                box.selectable.hovered ? 'hover' : 'not-hover',
                target ? 'target' : 'not-target',
                (box.selectable.resizeable.top && box.selectable.resizeable.left) ? 'resizeable-nw' : 'not-resizeable-nw',
                (box.selectable.resizeable.top && box.selectable.resizeable.right) ? 'resizeable-ne' : 'not-resizeable-ne',
                (box.selectable.resizeable.bottom && box.selectable.resizeable.left) ? 'resizeable-sw' : 'not-resizeable-sw',
                (box.selectable.resizeable.bottom && box.selectable.resizeable.right) ? 'resizeable-se' : 'not-resizeable-se',
                box.selectable.isDropZone ? 'isDropZone' : 'not-isDropZone',
                sticky.left ? 'stycky-left' : 'not-stycky-left',
                sticky.top ? 'stycky-top' : 'not-stycky-top',
                sticky.right ? 'stycky-right' : 'not-stycky-right',
                sticky.bottom ? 'stycky-bottom' : 'not-stycky-bottom',
                aboutToDrop ? 'aboutToDrop' : 'not-aboutToDrop',
            ]);
            return box;
        }
        /**
         * hide the whole UI
         */
        hideUi(hide) {
            this.overlay.contentDocument.body.style.display = hide ? 'none' : '';
        }
    }
    exports.Ui = Ui;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVWkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHMvVWkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQVVBLE1BQWEsRUFBRTtRQXVCYixZQUE0QixNQUF5QixFQUFTLE9BQTBCLEVBQVUsS0FBaUI7WUFBdkYsV0FBTSxHQUFOLE1BQU0sQ0FBbUI7WUFBUyxZQUFPLEdBQVAsT0FBTyxDQUFtQjtZQUFVLFVBQUssR0FBTCxLQUFLLENBQVk7WUF0QnpHLFVBQUssR0FBZSxFQUFFLENBQUM7WUFzSHpCLG1CQUFjLEdBQXNCLEVBQUUsQ0FBQztZQXNCdkMsaUJBQVksR0FBWSxLQUFLLENBQUM7WUFySHBDLG1CQUFtQjtZQUNuQixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUk7WUFDdEIsdURBQXVEO1lBQ3ZELGlCQUFRLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsRUFDdEQsS0FBSyxDQUFDLFNBQVMsQ0FDYixDQUFDLFdBQW1DLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQ2pFLENBQUMsS0FBWSxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUNwQyxFQUNELEtBQUssQ0FBQyxTQUFTLENBQ2IsQ0FBQyxLQUFpQixFQUFFLFNBQXFCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxFQUNuRixDQUFDLEtBQVcsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FDN0IsRUFDRCxLQUFLLENBQUMsU0FBUyxDQUNiLENBQUMsS0FBYyxFQUFFLFNBQWtCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxFQUMxRSxDQUFDLEtBQVcsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUs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