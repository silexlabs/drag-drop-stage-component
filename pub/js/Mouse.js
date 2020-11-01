define(["require", "exports", "./Types", "./utils/DomMetrics", "./flux/MouseState", "./flux/SelectionState", "./flux/UiState", "./utils/Events", "./flux/SelectableState"], function (require, exports, types, DomMetrics, MouseState, SelectionAction, UiState, Events_1, SelectableState_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Mouse = exports.MouseMode = void 0;
    var MouseMode;
    (function (MouseMode) {
        MouseMode[MouseMode["UP"] = 0] = "UP";
        MouseMode[MouseMode["DOWN"] = 1] = "DOWN";
        MouseMode[MouseMode["DRAGGING"] = 2] = "DRAGGING";
        MouseMode[MouseMode["WAITING_DBL_CLICK_DOWN"] = 3] = "WAITING_DBL_CLICK_DOWN";
        MouseMode[MouseMode["WAITING_DBL_CLICK_DOWN2"] = 4] = "WAITING_DBL_CLICK_DOWN2";
        MouseMode[MouseMode["WAITING_DBL_CLICK_UP"] = 5] = "WAITING_DBL_CLICK_UP";
    })(MouseMode = exports.MouseMode || (exports.MouseMode = {}));
    class Mouse {
        constructor(winStage, winOverlay, store, hooks) {
            this.winStage = winStage;
            this.winOverlay = winOverlay;
            this.store = store;
            this.hooks = hooks;
            this.mouseMode = MouseMode.UP; // public for unit tests
            this.wasMultiSelected = false;
            this.unsubscribeAll = [];
            // events from inside the iframe
            this.unsubscribeAll.push(Events_1.addEvent(this.winOverlay, 'scroll', (e) => this.scroll(e), true), Events_1.addEvent(this.winOverlay.document, 'mousedown', (e) => this.down(e), true), Events_1.addEvent(this.winOverlay.document, 'mouseup', (e) => this.up(e), true), Events_1.addEvent(this.winOverlay.document, 'mousemove', (e) => this.move(e), true), 
            // events from outside of the iframe
            Events_1.addEvent(document, 'mouseup', (e) => this.upOut(e), true), Events_1.addEvent(document, 'mousemove', (e) => this.moveOut(e), true));
        }
        cleanup() {
            this.unsubscribeAll.forEach(u => u());
        }
        /**
         * safe subscribe to mouse event
         * handle the multiple iframes and the current window
         * @return function to call to unsubscribe
         */
        subscribeMouseEvent(type, cbk) {
            const unsubscribeArray = [
                Events_1.addEvent(this.winOverlay, type, (e) => cbk(e), true),
                Events_1.addEvent(document, type, (e) => cbk(e), true),
            ];
            return () => unsubscribeArray.forEach(u => u());
        }
        //////////////////////////////
        scroll(e) {
            const scroll = DomMetrics.getScroll(this.winOverlay.document);
            this.store.dispatch(MouseState.setScroll(scroll));
        }
        down(e) {
            if (!this.store.getState().ui.catchingEvents)
                return;
            try {
                // in firefox, this is needed to keep recieving events while dragging outside the iframe
                // in chrome this will throw an error
                e.target['setCapture']();
            }
            catch (e) { }
            e.preventDefault(); // prevent default text selection
            const mouseData = this.eventToMouseData(e);
            if (this.mouseMode === MouseMode.WAITING_DBL_CLICK_UP) {
                this.mouseMode = MouseMode.WAITING_DBL_CLICK_DOWN2;
            }
            else if (this.mouseMode === MouseMode.DRAGGING) {
                // this happens when forcing drag/drop with Stage::startDrag
                this.mouseMode = MouseMode.UP;
                this.onDrop(mouseData);
            }
            else {
                this.mouseMode = MouseMode.WAITING_DBL_CLICK_DOWN;
                this.firstOnDownMouseData = mouseData;
                const id = setTimeout(() => {
                    if (this.mouseMode === MouseMode.WAITING_DBL_CLICK_DOWN) {
                        this.mouseMode = MouseMode.DOWN;
                        this.firstOnDownMouseData = null;
                        this.onDown(mouseData);
                    }
                    else if (this.mouseMode === MouseMode.WAITING_DBL_CLICK_UP) {
                        this.mouseMode = MouseMode.DOWN;
                        this.firstOnDownMouseData = null;
                        this.onDown(mouseData);
                        this.mouseMode = MouseMode.UP;
                        this.onUp(mouseData);
                    }
                }, 300);
                this.clearTimeout = () => {
                    clearTimeout(id);
                    this.clearTimeout = null;
                };
            }
        }
        up(e, offset = null) {
            if (!this.store.getState().ui.catchingEvents)
                return;
            e.preventDefault();
            const mouseData = this.eventToMouseData(e, offset);
            if (this.mouseMode === MouseMode.WAITING_DBL_CLICK_DOWN) {
                this.mouseMode = MouseMode.WAITING_DBL_CLICK_UP;
            }
            else if (this.mouseMode === MouseMode.WAITING_DBL_CLICK_DOWN2) {
                this.clearTimeout();
                this.mouseMode = MouseMode.UP;
                this.onDblClick(mouseData);
            }
            else if (this.mouseMode === MouseMode.DOWN) {
                this.mouseMode = MouseMode.UP;
                this.onUp(mouseData);
            }
            else if (this.mouseMode === MouseMode.DRAGGING) {
                this.mouseMode = MouseMode.UP;
                this.onDrop(mouseData);
            }
        }
        move(e, offset = null) {
            if (!this.store.getState().ui.catchingEvents)
                return;
            e.preventDefault();
            const mouseData = this.eventToMouseData(e, offset);
            // update mouse data
            this.store.dispatch(MouseState.setMouseData(mouseData));
            // update hovered state
            // one could use the store.getState().mouseState.mouseData.hovered
            // but the change event is used by the Ui.ts to detect that a box should change
            const updated = this.store.getState().selectables
                .filter((state) => state.hovered !== mouseData.hovered.includes(state.el));
            if (updated.length > 0) {
                this.store.dispatch(SelectableState_1.updateSelectables(updated
                    .map((state) => (Object.assign(Object.assign({}, state), { hovered: mouseData.hovered.includes(state.el) })))));
            }
            // chose action depending on position and state
            switch (this.mouseMode) {
                case MouseMode.WAITING_DBL_CLICK_UP:
                    this.mouseMode = MouseMode.DOWN;
                    this.onDown(this.firstOnDownMouseData);
                    this.mouseMode = MouseMode.UP;
                    this.onUp(this.firstOnDownMouseData);
                    this.onMove(mouseData);
                    break;
                case MouseMode.WAITING_DBL_CLICK_DOWN:
                case MouseMode.WAITING_DBL_CLICK_DOWN2:
                    this.mouseMode = MouseMode.DOWN;
                    this.onDown(this.firstOnDownMouseData);
                // no break; here
                case MouseMode.DOWN:
                    this.mouseMode = MouseMode.DRAGGING;
                    this.onStartDrag(mouseData);
                    break;
                case MouseMode.DRAGGING:
                    this.onDrag(mouseData);
                    break;
                default:
                    this.onMove(mouseData);
            }
            this.firstOnDownMouseData = null;
        }
        upOut(e) {
            if (this.mouseMode !== MouseMode.UP) {
                const iframe = this.winOverlay.frameElement.getBoundingClientRect();
                this.up(e, iframe);
            }
        }
        moveOut(e) {
            if (this.mouseMode !== MouseMode.UP) {
                const iframe = this.winOverlay.frameElement.getBoundingClientRect();
                this.move(e, iframe);
            }
        }
        eventToMouseData(e, offset = null) {
            const x = e.clientX - (offset ? offset.left : 0);
            const y = e.clientY - (offset ? offset.top : 0);
            const hovered = DomMetrics.findSelectableUnderMouse(this.winStage.document, this.store, x, y);
            const target = !!hovered ? hovered[0] : null;
            return {
                movementX: e.movementX,
                movementY: e.movementY,
                mouseX: x,
                mouseY: y,
                shiftKey: e.shiftKey,
                target,
                hovered,
            };
        }
        /////////////////////////////////////
        onDblClick(mouseData) {
            const { target, shiftKey } = mouseData;
            const selectable = DomMetrics.getSelectable(this.store, target);
            if (shiftKey) {
                this.store.dispatch(SelectionAction.add(selectable));
            }
            else if (selectable) {
                if (!selectable.selected) {
                    this.store.dispatch(SelectionAction.set([selectable]));
                }
            }
            if (this.hooks.onEdit)
                this.hooks.onEdit();
        }
        onDown(mouseData) {
            const { target, shiftKey } = mouseData;
            const selectable = DomMetrics.getSelectable(this.store, target);
            if (selectable && selectable.selectable) {
                this.wasMultiSelected = DomMetrics.getSelection(this.store).length > 1 && selectable.selected;
                if (this.wasMultiSelected || shiftKey) {
                    this.store.dispatch(SelectionAction.add(selectable));
                }
                else {
                    this.store.dispatch(SelectionAction.set([selectable]));
                }
            }
            else {
                this.wasMultiSelected = false;
            }
        }
        onUp(mouseData) {
            const { target, shiftKey } = mouseData;
            const selectable = DomMetrics.getSelectable(this.store, target);
            if (selectable && selectable.selectable) {
                if (shiftKey) {
                    if (this.wasMultiSelected && selectable.selected) {
                        this.store.dispatch(SelectionAction.remove(selectable));
                    }
                }
                else {
                    this.store.dispatch(SelectionAction.set([selectable]));
                }
            }
            else if (!shiftKey) {
                this.store.dispatch(SelectionAction.reset());
            }
            this.wasMultiSelected = false;
        }
        onMove(mouseData) {
            const { mouseX, mouseY, target } = mouseData;
            const selectable = DomMetrics.getSelectable(this.store, target);
            this.store.dispatch(MouseState.setCursorData(DomMetrics.getCursorData(mouseX, mouseY, this.store.getState().mouse.scrollData, selectable)));
        }
        onDrag(mouseData) {
        }
        onStartDrag(mouseData) {
            // draw or resize or move
            const selectable = DomMetrics.getSelectable(this.store, mouseData.target);
            if (selectable) {
                const direction = this.store.getState().mouse.cursorData;
                // start resize
                if (DomMetrics.isResizeable(selectable.resizeable, direction)) {
                    this.store.dispatch(UiState.setMode(types.UiMode.RESIZE));
                }
                // start drag
                else if (selectable.draggable) {
                    this.store.dispatch(UiState.setMode(types.UiMode.DRAG));
                }
                else {
                    this.store.dispatch(UiState.setMode(types.UiMode.DRAW));
                }
            }
            else {
                this.store.dispatch(UiState.setMode(types.UiMode.DRAW));
            }
        }
        onDrop(mouseData) {
            this.store.dispatch(UiState.setMode(types.UiMode.NONE));
        }
    }
    exports.Mouse = Mouse;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW91c2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHMvTW91c2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVNBLElBQVksU0FPWDtJQVBELFdBQVksU0FBUztRQUNuQixxQ0FBRSxDQUFBO1FBQ0YseUNBQUksQ0FBQTtRQUNKLGlEQUFRLENBQUE7UUFDUiw2RUFBc0IsQ0FBQTtRQUN0QiwrRUFBdUIsQ0FBQTtRQUN2Qix5RUFBb0IsQ0FBQTtJQUN0QixDQUFDLEVBUFcsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFPcEI7SUFFRCxNQUFhLEtBQUs7UUFHaEIsWUFBb0IsUUFBZ0IsRUFBVSxVQUFrQixFQUFVLEtBQWlCLEVBQVUsS0FBa0I7WUFBbkcsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUFVLGVBQVUsR0FBVixVQUFVLENBQVE7WUFBVSxVQUFLLEdBQUwsS0FBSyxDQUFZO1lBQVUsVUFBSyxHQUFMLEtBQUssQ0FBYTtZQUZ2SCxjQUFTLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLHdCQUF3QjtZQUMxQyxxQkFBZ0IsR0FBWSxLQUFLLENBQUM7WUFjbEMsbUJBQWMsR0FBc0IsRUFBRSxDQUFDO1lBWjdDLGdDQUFnQztZQUNoQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FDdEIsaUJBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQVksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDM0UsaUJBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFZLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ3JGLGlCQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsU0FB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