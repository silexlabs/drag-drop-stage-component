define(["require", "exports", "./MouseHandlerBase", "../flux/SelectableState", "../flux/MouseState", "../utils/DomMetrics", "../flux/UiState", "../Constants"], function (require, exports, MouseHandlerBase_1, selectableState, mouseState, domMetrics, UiState_1, Constants_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResizeHandler = void 0;
    class ResizeHandler extends MouseHandlerBase_1.MouseHandlerBase {
        constructor(stageDocument, overlayDocument, store, hooks) {
            super(stageDocument, overlayDocument, store, hooks);
            // direction
            this.cursorData = this.store.getState().mouse.cursorData;
            // keep only risizeable elements
            this.selection = this.selection.filter(s => domMetrics.isResizeable(s.resizeable, this.cursorData));
            // notify the app
            if (!!this.hooks.onStartResize)
                this.hooks.onStartResize(this.selection);
        }
        /**
         * Called by the Stage class when mouse moves
         */
        update(mouseData) {
            super.update(mouseData);
            // set a new size
            this.selection = this.selection.map((selectable) => {
                // handle the width and height computation
                const clientRect = Object.assign({}, selectable.metrics.clientRect);
                const computedStyleRect = Object.assign({}, selectable.metrics.computedStyleRect);
                switch (this.cursorData.x) {
                    case '':
                        break;
                    case 'left':
                        computedStyleRect.width -= mouseData.movementX;
                        clientRect.width -= mouseData.movementX;
                        break;
                    case 'right':
                        computedStyleRect.width += mouseData.movementX;
                        clientRect.width += mouseData.movementX;
                        break;
                    default: throw new Error('unknown direction ' + this.cursorData.x);
                }
                if (this.cursorData.y != '') {
                    if (mouseData.shiftKey && this.cursorData.x != '') {
                        computedStyleRect.height = computedStyleRect.width * selectable.metrics.proportions;
                        clientRect.height = clientRect.width * selectable.metrics.proportions;
                    }
                    else {
                        if (this.cursorData.y === 'top') {
                            computedStyleRect.height -= mouseData.movementY;
                            clientRect.height -= mouseData.movementY;
                        }
                        else {
                            computedStyleRect.height += mouseData.movementY;
                            clientRect.height += mouseData.movementY;
                        }
                    }
                }
                // handle the position change
                if (this.cursorData.x === 'left') {
                    // compute the change
                    computedStyleRect.left += mouseData.movementX;
                    clientRect.left += mouseData.movementX;
                }
                if (this.cursorData.y === 'top') {
                    // compute the change
                    computedStyleRect.top += mouseData.movementY;
                    clientRect.top += mouseData.movementY;
                }
                // handle the case where the resize has not been possible
                // either because the content is too big, or a min-whidth/height has overriden our changes
                if (this.cursorData.x !== '') {
                    //  store initial data
                    const initialWidth = selectable.el.style.width;
                    // move to the final position will take the new parent offset
                    selectable.el.style.width = Math.max(Constants_1.MIN_SIZE, computedStyleRect.width) + 'px';
                    // check for the offset and update the metrics
                    const bb = domMetrics.getBoundingBoxDocument(selectable.el);
                    const delta = clientRect.width - bb.width;
                    computedStyleRect.width -= delta;
                    clientRect.width -= delta;
                    if (this.cursorData.x === 'left') {
                        computedStyleRect.left += delta;
                        clientRect.left += delta;
                    }
                    // restore the initial data
                    selectable.el.style.width = initialWidth;
                }
                // handle the case where the resize has not been possible
                // either because the content is too big, or a min-whidth/height has overriden our changes
                if (this.cursorData.y !== '') {
                    //  store initial data
                    const heightAttr = selectable.useMinHeight ? 'minHeight' : 'height';
                    const initialHeight = selectable.el.style[heightAttr];
                    // move to the final position will take the new parent offset
                    selectable.el.style[heightAttr] = Math.max(Constants_1.MIN_SIZE, computedStyleRect.height) + 'px';
                    // check for the offset and update the metrics
                    const bb = domMetrics.getBoundingBoxDocument(selectable.el);
                    const delta = clientRect.height - bb.height;
                    computedStyleRect.height -= delta;
                    clientRect.height -= delta;
                    if (this.cursorData.y === 'top') {
                        computedStyleRect.top += delta;
                        clientRect.top += delta;
                    }
                    // restore the initial data
                    selectable.el.style[heightAttr] = initialHeight;
                }
                // update bottom and right
                computedStyleRect.right = computedStyleRect.left + computedStyleRect.width;
                clientRect.right = clientRect.left + clientRect.width;
                computedStyleRect.bottom = computedStyleRect.top + computedStyleRect.height;
                clientRect.bottom = clientRect.top + clientRect.height;
                // update the metrics
                return Object.assign(Object.assign({}, selectable), { metrics: Object.assign(Object.assign({}, selectable.metrics), { clientRect,
                        computedStyleRect }) });
            });
            // dispatch all the changes at once
            this.store.dispatch(selectableState.updateSelectables(this.selection));
            // update scroll
            const initialScroll = this.store.getState().mouse.scrollData;
            const bb = {
                top: mouseData.mouseY + initialScroll.y,
                left: mouseData.mouseX + initialScroll.x,
                bottom: mouseData.mouseY + initialScroll.y,
                right: mouseData.mouseX + initialScroll.x,
                height: 0,
                width: 0,
            };
            const scroll = domMetrics.getScrollToShow(this.stageDocument, bb);
            if (scroll.x !== initialScroll.x || scroll.y !== initialScroll.y) {
                this.debounceScroll(scroll);
            }
            // notify the app
            if (this.hooks.onResize)
                this.hooks.onResize(this.selection, bb);
        }
        /**
         * Called by the Stage class when mouse button is released
         */
        release() {
            super.release();
            // reset the state of the mouse
            // this is useful when the resize has not been taken into account (e.g. content too big)
            // and the mouse is not on the edge of the element anymore
            const state = this.store.getState();
            const selectable = domMetrics.getSelectable(this.store, state.mouse.mouseData.target);
            this.store.dispatch(mouseState.setCursorData(domMetrics.getCursorData(state.mouse.mouseData.mouseX, state.mouse.mouseData.mouseY, state.mouse.scrollData, selectable)));
            // update the real metrics after drop
            setTimeout(() => {
                // change UI state while selectables metrics are simply updated
                this.store.dispatch(UiState_1.setRefreshing(true));
                const updatedState = this.store.getState().selectables
                    .map(selectable => {
                    return Object.assign(Object.assign({}, selectable), { metrics: domMetrics.getMetrics(selectable.el) });
                });
                this.store.dispatch(selectableState.updateSelectables(updatedState));
                // change UI state while selectables metrics are simply updated
                this.store.dispatch(UiState_1.setRefreshing(false));
                // notify the app
                if (this.hooks.onResizeEnd)
                    this.hooks.onResizeEnd(this.selection);
            }, 0);
        }
    }
    exports.ResizeHandler = ResizeHandler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzaXplSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy9oYW5kbGVycy9SZXNpemVIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFTQSxNQUFhLGFBQWMsU0FBUSxtQ0FBZ0I7UUFFakQsWUFBWSxhQUEyQixFQUFFLGVBQTZCLEVBQUUsS0FBaUIsRUFBRSxLQUFZO1lBQ3JHLEtBQUssQ0FBQyxhQUFhLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVwRCxZQUFZO1lBQ1osSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUM7WUFFekQsZ0NBQWdDO1lBQ2hDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFFcEcsaUJBQWlCO1lBQ2pCLElBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYTtnQkFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDMUUsQ0FBQztRQUVEOztXQUVHO1FBQ0gsTUFBTSxDQUFDLFNBQW9CO1lBQ3pCLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFeEIsaUJBQWlCO1lBQ2pCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUEyQixFQUFFLEVBQUU7Z0JBQ2xFLDBDQUEwQztnQkFDMUMsTUFBTSxVQUFVLHFCQUNYLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUNqQyxDQUFDO2dCQUNGLE1B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