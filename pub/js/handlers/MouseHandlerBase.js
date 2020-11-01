define(["require", "exports", "../flux/MouseState"], function (require, exports, mouseState) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MouseHandlerBase = void 0;
    class MouseHandlerBase {
        constructor(stageDocument, overlayDocument, store, hooks) {
            this.stageDocument = stageDocument;
            this.overlayDocument = overlayDocument;
            this.store = store;
            this.hooks = hooks;
            /**
             * Debounce mechanism to handle auto scroll
             */
            this.debounceScrollPending = false;
            // store the selection
            this.selection = store.getState().selectables;
            this.selection = this.selection.filter(selectable => selectable.selected);
            // kepp in sync with mouse
            this.unsubsribe = store.subscribe((state, prevState) => this.update(state.mouseData), (state) => state.mouse);
            // listen for scroll
            this.unsubsribeScroll = this.store.subscribe((cur, prev) => this.onScroll(cur, prev), (state) => state.mouse.scrollData);
        }
        update(mouseData) { }
        ;
        release() {
            this.unsubsribeScroll();
            this.unsubsribe();
        }
        ;
        debounceScroll(scrollData) {
            if (!this.debounceScrollPending) {
                setTimeout(() => {
                    this.debounceScrollPending = false;
                    this.store.dispatch(mouseState.setScroll(this.debounceScrollData));
                }, 100);
            }
            this.debounceScrollPending = true;
            this.debounceScrollData = scrollData;
        }
        /**
         *  move the dragged elements back under the mouse
         */
        onScroll(state, prev) {
            const delta = {
                x: state.x - prev.x,
                y: state.y - prev.y,
            };
            const mouseData = this.store.getState().mouse.mouseData;
            // mouse did not move in the viewport, just in the document coordinate
            // the selection need to follow the mouse
            this.update(Object.assign(Object.assign({}, mouseData), { movementX: delta.x, movementY: delta.y }));
        }
    }
    exports.MouseHandlerBase = MouseHandlerBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW91c2VIYW5kbGVyQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy9oYW5kbGVycy9Nb3VzZUhhbmRsZXJCYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFLQSxNQUFhLGdCQUFnQjtRQUkzQixZQUFzQixhQUEyQixFQUFVLGVBQTZCLEVBQVksS0FBaUIsRUFBWSxLQUFZO1lBQXZILGtCQUFhLEdBQWIsYUFBYSxDQUFjO1lBQVUsb0JBQWUsR0FBZixlQUFlLENBQWM7WUFBWSxVQUFLLEdBQUwsS0FBSyxDQUFZO1lBQVksVUFBSyxHQUFMLEtBQUssQ0FBTztZQXdCN0k7O2VBRUc7WUFDSywwQkFBcUIsR0FBRyxLQUFLLENBQUM7WUExQnBDLHNCQUFzQjtZQUN0QixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxXQUFXLENBQUE7WUFDN0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUUxRSwwQkFBMEI7WUFDMUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUMvQixDQUFDLEtBQXVCLEVBQUUsU0FBMkIsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQ3RGLENBQUMsS0FBaUIsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FDbkMsQ0FBQztZQUVGLG9CQUFvQjtZQUNwQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQzFDLENBQUMsR0FBcUIsRUFBRSxJQUFzQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFDM0UsQ0FBQyxLQUFrQixFQUFvQixFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQ2pFLENBQUM7UUFDSixDQUFDO1FBQ0QsTUFBTSxDQUFDLFNBQW9CLElBQUcsQ0FBQztRQUFBLENBQUM7UUFDaEMsT0FBTztZQUNMLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNwQixDQUFDO1FBQUEsQ0FBQztRQVFRLGNBQWMsQ0FBQyxVQUE0QjtZQUNuRCxJQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFO2dCQUM5QixVQUFVLENBQUMsR0FBRyxFQUFFO29CQUNkLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxLQUFLLENBQUM7b0JBQ25DLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztnQkFDckUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ1Q7WUFDRCxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxVQUFVLENBQUM7UUFDdkMsQ0FBQztRQUdEOztXQUVHO1FBQ0gsUUFBUSxDQUFDLEtBQXVCLEVBQUUsSUFBc0I7WUFDdEQsTUFBTSxLQUFLLEdBQUc7Z0JBQ1osQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQ25CLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO2FBQ3BCLENBQUE7WUFDRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7WUFDeEQsc0VBQXNFO1lBQ3RFLHlDQUF5QztZQUN6QyxJQUFJLENBQUMsTUFBTSxpQ0FDTixTQUFTLEtBQ1osU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQ2xCLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUNsQixDQUFBO1FBQ0osQ0FBQztLQUNGO0lBOURELDRDQThEQyJ9