define(["require", "exports", "../utils/DomMetrics"], function (require, exports, DomMetrics) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MouseObserver = void 0;
    /**
     * @class This class listens to the store
     *   and apply the state changes to the view
     */
    class MouseObserver {
        constructor(stageDocument, overlayDocument, store, hooks) {
            this.stageDocument = stageDocument;
            this.overlayDocument = overlayDocument;
            this.hooks = hooks;
            this.unsubscribeAll = [];
            this.unsubscribeAll.push(store.subscribe((state, prevState) => this.onStateChanged(state, prevState), (state) => state.mouse));
        }
        cleanup() {
            this.unsubscribeAll.forEach(u => u());
        }
        /**
         * handle state changes, detect changes of scroll or metrics or selection
         * @param {State} state
         * @param {State} prevState the old state obj
         */
        onStateChanged(state, prevState) {
            if (state.scrollData.x !== prevState.scrollData.x || state.scrollData.y !== prevState.scrollData.y) {
                DomMetrics.setScroll(this.stageDocument, state.scrollData);
            }
            // this is now in Ui.ts
            // if(state.cursorData.cursorType !== prevState.cursorData.cursorType) {
            //   this.doc.body.style.cursor = state.cursorData.cursorType;
            // }
        }
    }
    exports.MouseObserver = MouseObserver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW91c2VPYnNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy9vYnNlcnZlcnMvTW91c2VPYnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBSUE7OztPQUdHO0lBQ0gsTUFBYSxhQUFhO1FBQ3hCLFlBQW9CLGFBQTJCLEVBQVUsZUFBNkIsRUFBRSxLQUFpQixFQUFVLEtBQWtCO1lBQWpILGtCQUFhLEdBQWIsYUFBYSxDQUFjO1lBQVUsb0JBQWUsR0FBZixlQUFlLENBQWM7WUFBNkIsVUFBSyxHQUFMLEtBQUssQ0FBYTtZQU83SCxtQkFBYyxHQUFzQixFQUFFLENBQUM7WUFON0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FDdEMsQ0FBQyxLQUF1QixFQUFFLFNBQTJCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxFQUMvRixDQUFDLEtBQWlCLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQ25DLENBQUMsQ0FBQztRQUNMLENBQUM7UUFHRCxPQUFPO1lBQ0wsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsY0FBYyxDQUFDLEtBQXVCLEVBQUUsU0FBMkI7WUFDakUsSUFBRyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRTtnQkFDakcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUM1RDtZQUNELHVCQUF1QjtZQUN2Qix3RUFBd0U7WUFDeEUsOERBQThEO1lBQzlELElBQUk7UUFDTixDQUFDO0tBQ0Y7SUEzQkQsc0NBMkJDIn0=