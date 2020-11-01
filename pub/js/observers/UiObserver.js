define(["require", "exports", "../Types", "../handlers/ResizeHandler", "../handlers/DrawHandler", "../handlers/MoveHandler"], function (require, exports, types, ResizeHandler_1, DrawHandler_1, MoveHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UiObserver = void 0;
    /**
     * @class This class listens to the store
     *   and apply the state changes to the DOM elements
     */
    class UiObserver {
        constructor(stageDocument, overlayDocument, store, hooks) {
            this.stageDocument = stageDocument;
            this.overlayDocument = overlayDocument;
            this.store = store;
            this.hooks = hooks;
            this.unsubscribeAll = [];
            this.handler = null;
            this.unsubscribeAll.push(store.subscribe((state, prevState) => this.onUiStateChanged(state, prevState), (state) => state.ui));
        }
        cleanup() {
            this.unsubscribeAll.forEach(u => u());
        }
        /**
         * handle state changes, detect changes of scroll or metrics or selection
         * @param {State} state
         * @param {State} prevState the old state obj
         */
        onUiStateChanged(state, prevState) {
            if (prevState.mode !== state.mode) {
                if (this.handler) {
                    this.handler.release();
                    this.handler = null;
                }
                // add css class and style
                this.overlayDocument.body.classList.remove(...[
                    state.mode !== types.UiMode.DRAG ? 'dragging-mode' : 'not-dragging-mode',
                    state.mode !== types.UiMode.RESIZE ? 'resizing-mode' : 'not-resizing-mode',
                    state.mode !== types.UiMode.DRAW ? 'drawing-mode' : 'not-drawing-mode',
                ]);
                this.overlayDocument.body.classList.add(...[
                    state.mode === types.UiMode.DRAG ? 'dragging-mode' : 'not-dragging-mode',
                    state.mode === types.UiMode.RESIZE ? 'resizing-mode' : 'not-resizing-mode',
                    state.mode === types.UiMode.DRAW ? 'drawing-mode' : 'not-drawing-mode',
                ]);
                // manage handlers
                switch (state.mode) {
                    case types.UiMode.NONE:
                        break;
                    case types.UiMode.DRAG:
                        this.handler = new MoveHandler_1.MoveHandler(this.stageDocument, this.overlayDocument, this.store, this.hooks);
                        break;
                    case types.UiMode.RESIZE:
                        this.handler = new ResizeHandler_1.ResizeHandler(this.stageDocument, this.overlayDocument, this.store, this.hooks);
                        break;
                    case types.UiMode.DRAW:
                        this.handler = new DrawHandler_1.DrawHandler(this.stageDocument, this.overlayDocument, this.store, this.hooks);
                        break;
                }
            }
        }
    }
    exports.UiObserver = UiObserver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVWlPYnNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy9vYnNlcnZlcnMvVWlPYnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBT0E7OztPQUdHO0lBQ0gsTUFBYSxVQUFVO1FBRXJCLFlBQW9CLGFBQTJCLEVBQVUsZUFBNkIsRUFBVSxLQUFpQixFQUFVLEtBQWtCO1lBQXpILGtCQUFhLEdBQWIsYUFBYSxDQUFjO1lBQVUsb0JBQWUsR0FBZixlQUFlLENBQWM7WUFBVSxVQUFLLEdBQUwsS0FBSyxDQUFZO1lBQVUsVUFBSyxHQUFMLEtBQUssQ0FBYTtZQVFySSxtQkFBYyxHQUFzQixFQUFFLENBQUM7WUFQN0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDcEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FDdEMsQ0FBQyxLQUFvQixFQUFFLFNBQXdCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQzNGLENBQUMsS0FBaUIsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FDaEMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUdELE9BQU87WUFDTCxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxnQkFBZ0IsQ0FBQyxLQUFvQixFQUFFLFNBQXdCO1lBQzdELElBQUcsU0FBUyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsSUFBSSxFQUFFO2dCQUNoQyxJQUFHLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7aUJBQ3JCO2dCQUNELDBCQUEwQjtnQkFDMUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHO29CQUM1QyxLQUFLLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLG1CQUFtQjtvQkFDeEUsS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxtQkFBbUI7b0JBQzFFLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCO2lCQUN2RSxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHO29CQUN6QyxLQUFLLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLG1CQUFtQjtvQkFDeEUsS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxtQkFBbUI7b0JBQzFFLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCO2lCQUN2RSxDQUFDLENBQUM7Z0JBQ0gsa0JBQWtCO2dCQUNsQixRQUFPLEtBQUssQ0FBQyxJQUFJLEVBQUM7b0JBQ2hCLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJO3dCQUNwQixNQUFNO29CQUNSLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJO3dCQUNwQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUkseUJBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ2pHLE1BQU07b0JBQ1IsS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU07d0JBQ3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSw2QkFBYSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDbkcsTUFBTTtvQkFDUixLQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSTt3QkFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLHlCQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUNqRyxNQUFNO2lCQUNUO2FBQ0Y7UUFDSCxDQUFDO0tBQ0Y7SUFyREQsZ0NBcURDIn0=