define(["require", "exports", "./MouseHandlerBase", "../flux/SelectionState", "../utils/DomMetrics"], function (require, exports, MouseHandlerBase_1, selectionState, domMetrics) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DrawHandler = void 0;
    class DrawHandler extends MouseHandlerBase_1.MouseHandlerBase {
        constructor(stageDocument, overlayDocument, store, hooks) {
            super(stageDocument, overlayDocument, store, hooks);
            // notify the app
            if (!!this.hooks.onStartDraw)
                this.hooks.onStartDraw();
            const state = store.getState();
            const scrollData = domMetrics.getScroll(this.stageDocument);
            this.initialX = state.mouse.mouseData.mouseX + scrollData.x;
            this.initialY = state.mouse.mouseData.mouseY + scrollData.y;
            // create and attach a div to draw the region
            // FIXME: the region marker should be outside the iframe
            this.regionMarker = overlayDocument.createElement('div');
            this.regionMarker.classList.add('region-marker');
            this.moveRegion({ left: -999, top: -999, right: -999, bottom: -999, width: 0, height: 0 });
            overlayDocument.body.appendChild(this.regionMarker);
        }
        update(mouseData) {
            super.update(mouseData);
            const scrollData = domMetrics.getScroll(this.stageDocument);
            const bb = {
                left: Math.min(this.initialX, (mouseData.mouseX + scrollData.x)),
                top: Math.min(this.initialY, (mouseData.mouseY + scrollData.y)),
                right: Math.max(this.initialX, (mouseData.mouseX + scrollData.x)),
                bottom: Math.max(this.initialY, (mouseData.mouseY + scrollData.y)),
                height: Math.abs(this.initialY - (mouseData.mouseY + scrollData.y)),
                width: Math.abs(this.initialX - (mouseData.mouseX + scrollData.x)),
            };
            // update the drawing
            this.moveRegion(bb);
            // select all elements which intersect with the region
            let newSelection = this.store.getState().selectables
                .filter(selectable => {
                return selectable.selectable &&
                    selectable.draggable && // do not select the background
                    selectable.metrics.clientRect.left < bb.right &&
                    selectable.metrics.clientRect.right > bb.left &&
                    selectable.metrics.clientRect.top < bb.bottom &&
                    selectable.metrics.clientRect.bottom > bb.top;
            });
            // handle removed elements
            this.selection
                .filter(selectable => !newSelection.find(s => selectable.el === s.el))
                .forEach(selectable => {
                this.store.dispatch(selectionState.remove(selectable));
            });
            // handle added elements
            newSelection
                .filter(selectable => !this.selection.find(s => selectable.el === s.el))
                .forEach(selectable => {
                this.store.dispatch(selectionState.add(selectable));
            });
            // store the new selection
            this.selection = newSelection;
            // update scroll
            const initialScroll = this.store.getState().mouse.scrollData;
            const scroll = domMetrics.getScrollToShow(this.stageDocument, bb);
            if (scroll.x !== initialScroll.x || scroll.y !== initialScroll.y) {
                this.debounceScroll(scroll);
            }
            // notify the app
            if (this.hooks.onDraw)
                this.hooks.onDraw(this.selection, bb);
        }
        release() {
            super.release();
            this.regionMarker.parentNode.removeChild(this.regionMarker);
            // notify the app
            if (this.hooks.onDrawEnd)
                this.hooks.onDrawEnd();
            this.selection = [];
        }
        /**
         * display the position marker atthe given positionin the dom
         */
        moveRegion({ left, top, width, height }) {
            this.regionMarker.style.width = width + 'px';
            this.regionMarker.style.height = height + 'px';
            this.regionMarker.style.transform = `translate(${left}px, ${top}px)`; // scale(${width}, ${height})
        }
    }
    exports.DrawHandler = DrawHandler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHJhd0hhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdHMvaGFuZGxlcnMvRHJhd0hhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQU9BLE1BQWEsV0FBWSxTQUFRLG1DQUFnQjtRQUsvQyxZQUFZLGFBQTJCLEVBQUUsZUFBNkIsRUFBRSxLQUFpQixFQUFFLEtBQVk7WUFDckcsS0FBSyxDQUFDLGFBQWEsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRXBELGlCQUFpQjtZQUNqQixJQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVc7Z0JBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUV0RCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFL0IsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDNUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUM1RCxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBRTVELDZDQUE2QztZQUM3Qyx3REFBd0Q7WUFDeEQsSUFBSSxDQUFDLFlBQVksR0FBRyxlQUFlLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pELElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNqRCxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxH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