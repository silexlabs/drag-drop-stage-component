define(["require", "exports", "./MouseHandlerBase", "../Types", "../flux/SelectableState", "../utils/DomMetrics", "../flux/UiState", "../Constants"], function (require, exports, MouseHandlerBase_1, Types_1, selectableState, domMetrics, UiState_1, Constants_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MoveHandler = exports.AUTOSCROLL_MARGIN = void 0;
    exports.AUTOSCROLL_MARGIN = 30;
    class MoveHandler extends MouseHandlerBase_1.MouseHandlerBase {
        constructor(stageDocument, overlayDocument, store, hooks) {
            super(stageDocument, overlayDocument, store, hooks);
            // keep only draggable elements
            // which are not in a selected element also being dragged
            this.selection = this.selection
                .filter(s => s.draggable)
                .filter(s => !domMetrics.hasASelectedDraggableParent(store, s.el));
            // notify the app
            if (!!this.hooks.onStartDrag)
                this.hooks.onStartDrag(this.selection);
            // FIXME: the region marker should be outside the iframe
            this.positionMarker = this.stageDocument.createElement('div');
            this.positionMarker.classList.add('position-marker');
            this.positionMarker.style.backgroundColor = 'rgba(0, 0, 0, .5)';
            this.positionMarker.style.display = 'inline-block';
            this.positionMarker.style.border = '1px solid rgba(255, 255, 255, .5)';
            this.positionMarker.style.position = 'absolute';
            this.positionMarker.style.minWidth = '1px';
            this.positionMarker.style.minHeight = '1px';
            // update state
            this.selection = this.selection.map(selectable => {
                return Object.assign(Object.assign({}, selectable), { preventMetrics: true, translation: {
                        x: 0,
                        y: 0,
                    } });
            });
            // update store
            this.store.dispatch(selectableState.updateSelectables(this.selection));
        }
        /**
         * Called by the Stage class when mouse moves
         */
        update(mouseData) {
            super.update(mouseData);
            if (this.selection.length === 0) {
                // This seems to happen when the user moves the mouse fast
                return;
            }
            // remove the marker
            if (this.positionMarker.parentNode)
                this.positionMarker.parentNode.removeChild(this.positionMarker);
            if (!this.initialMouse) {
                this.initialMouse = {
                    x: mouseData.mouseX - mouseData.movementX,
                    y: mouseData.mouseY - mouseData.movementY,
                };
            }
            if (!this.initialScroll) {
                this.initialScroll = Object.assign({}, this.store.getState().mouse.scrollData);
            }
            const currentScroll = Object.assign({}, this.store.getState().mouse.scrollData);
            const deltaScroll = {
                x: currentScroll.x - this.initialScroll.x,
                y: currentScroll.y - this.initialScroll.y,
            };
            // apply constraints (shift) and
            // compute the real movementX and movementY based on the position of the mouse instead of the position of the selection
            const { movementX, movementY } = (() => {
                const translation = this.selection[0].translation;
                const realMovementX = -translation.x + (mouseData.mouseX - this.initialMouse.x);
                const realMovementY = -translation.y + (mouseData.mouseY - this.initialMouse.y);
                if (mouseData.shiftKey && this.selection.length > 0) {
                    const { x, y } = {
                        x: mouseData.mouseX - this.initialMouse.x,
                        y: mouseData.mouseY - this.initialMouse.y,
                    };
                    const angle = Math.atan2(y, x);
                    if (Math.abs(Math.sin(angle)) < Math.abs(Math.cos(angle))) {
                        // stick to x axis
                        return {
                            movementX: realMovementX,
                            movementY: -translation.y,
                        };
                    }
                    else {
                        // stick to y axis
                        return {
                            movementX: -translation.x,
                            movementY: realMovementY,
                        };
                    }
                }
                return {
                    movementX: realMovementX + deltaScroll.x,
                    movementY: realMovementY + deltaScroll.y,
                };
            })();
            // apply constraints (sticky)
            const bb = domMetrics.getBoundingBox(this.selection);
            const hasPositionedElements = this.selection.some(s => s.metrics.position === 'static');
            const sticky = !this.store.getState().ui.enableSticky || hasPositionedElements ? Types_1.EMPTY_BOX()
                : this.store.getState().selectables
                    .filter(s => !s.selected && s.selectable && s.metrics.position !== 'static')
                    .reduce((prev, selectable) => {
                    if (Math.abs(selectable.metrics.clientRect.top - (bb.top + movementY)) < Constants_1.STICK_DISTANCE)
                        prev.top = selectable.metrics.clientRect.top - bb.top;
                    if (Math.abs(selectable.metrics.clientRect.left - (bb.left + movementX)) < Constants_1.STICK_DISTANCE)
                        prev.left = selectable.metrics.clientRect.left - bb.left;
                    if (Math.abs(selectable.metrics.clientRect.bottom - (bb.bottom + movementY)) < Constants_1.STICK_DISTANCE)
                        prev.bottom = selectable.metrics.clientRect.bottom - bb.bottom;
                    if (Math.abs(selectable.metrics.clientRect.right - (bb.right + movementX)) < Constants_1.STICK_DISTANCE)
                        prev.right = selectable.metrics.clientRect.right - bb.right;
                    if (Math.abs(selectable.metrics.clientRect.bottom - (bb.top + movementY)) < Constants_1.STICK_DISTANCE)
                        prev.top = selectable.metrics.clientRect.bottom - bb.top;
                    if (Math.abs(selectable.metrics.clientRect.right - (bb.left + movementX)) < Constants_1.STICK_DISTANCE)
                        prev.left = selectable.metrics.clientRect.right - bb.left;
                    if (Math.abs(selectable.metrics.clientRect.top - (bb.bottom + movementY)) < Constants_1.STICK_DISTANCE)
                        prev.bottom = selectable.metrics.clientRect.top - bb.bottom;
                    if (Math.abs(selectable.metrics.clientRect.left - (bb.right + movementX)) < Constants_1.STICK_DISTANCE)
                        prev.right = selectable.metrics.clientRect.left - bb.right;
                    return prev;
                }, Types_1.EMPTY_BOX());
            const stickyMovementX = (sticky.left === null ? (sticky.right == null ? movementX : sticky.right) : sticky.left);
            const stickyMovementY = (sticky.top === null ? (sticky.bottom == null ? movementY : sticky.bottom) : sticky.top);
            // update elements postition
            this.selection = this.selection
                .map(selectable => domMetrics.move(selectable, false, stickyMovementX, stickyMovementY));
            // update the destination of each element
            this.selection = this.selection
                .map(selectable => {
                let dropZones = domMetrics.findDropZonesUnderMouse(this.stageDocument, this.store, this.hooks, mouseData.mouseX, mouseData.mouseY)
                    .filter(dropZone => this.hooks.canDrop(selectable.el, dropZone));
                let dropZoneUnderMouse = dropZones[0]; // the first one is supposed to be the top most one
                if (dropZoneUnderMouse) {
                    switch (selectable.metrics.position) {
                        case 'static':
                            let nearestPosition = this.findNearestPosition(dropZoneUnderMouse, mouseData.mouseX, mouseData.mouseY);
                            return this.updateDestinationNonAbsolute(selectable, nearestPosition);
                        default:
                            return this.updateDestinationAbsolute(selectable, dropZoneUnderMouse);
                    }
                }
                else
                    return selectable;
            });
            // handle the children which move with the selection
            const children = this.store.getState().selectables
                .filter(s => domMetrics.hasASelectedDraggableParent(this.store, s.el))
                .map(selectable => domMetrics.move(selectable, true, movementX, movementY));
            // update store
            this.store.dispatch(selectableState.updateSelectables(this.selection.concat(children)));
            this.store.dispatch(UiState_1.setSticky({
                top: sticky.top !== null,
                left: sticky.left !== null,
                bottom: sticky.bottom !== null,
                right: sticky.right !== null,
            }));
            // update scroll
            const initialScroll = this.store.getState().mouse.scrollData;
            const scroll = domMetrics.getScrollToShow(this.stageDocument, {
                top: mouseData.mouseY + initialScroll.y - exports.AUTOSCROLL_MARGIN,
                bottom: mouseData.mouseY + initialScroll.y + exports.AUTOSCROLL_MARGIN,
                left: mouseData.mouseX + initialScroll.x - exports.AUTOSCROLL_MARGIN,
                right: mouseData.mouseX + initialScroll.x + exports.AUTOSCROLL_MARGIN,
                height: 2 * exports.AUTOSCROLL_MARGIN,
                width: 2 * exports.AUTOSCROLL_MARGIN,
            });
            if (scroll.x !== initialScroll.x || scroll.y !== initialScroll.y) {
                this.debounceScroll(scroll);
            }
            // notify the app
            if (this.hooks.onDrag)
                this.hooks.onDrag(this.selection, bb);
        }
        /**
         * Called by the Stage class when mouse button is released
         */
        release() {
            super.release();
            this.initialMouse = null;
            this.selection = this.selection.map((selectable) => {
                // move to a different container
                if (selectable.dropZone && selectable.dropZone.parent) {
                    if (selectable.dropZone.nextElementSibling) {
                        // if the target is not allready the sibling of the destination's sibling
                        // and if the destination's sibling is not the target itself
                        // then move to the desired position in the parent
                        if (selectable.dropZone.nextElementSibling !== selectable.el.nextElementSibling && selectable.dropZone.nextElementSibling !== selectable.el) {
                            try {
                                selectable.el.parentNode.removeChild(selectable.el);
                                selectable.dropZone.parent.insertBefore(selectable.el, selectable.dropZone.nextElementSibling);
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }
                    }
                    else {
                        // if the destination parent is not already the target's parent
                        // or if the target is not the last child
                        // then append the target to the parent
                        if (selectable.dropZone.parent !== selectable.el.parentElement || selectable.el.nextElementSibling) {
                            selectable.el.parentNode.removeChild(selectable.el);
                            selectable.dropZone.parent.appendChild(selectable.el);
                        }
                    }
                }
                let metrics = selectable.metrics;
                if (selectable.metrics.position !== 'static') {
                    // check the actual position of the target
                    // and move it to match the provided absolute position
                    // store initial data
                    const initialTop = selectable.el.style.top;
                    const initialLeft = selectable.el.style.left;
                    const initialTransform = selectable.el.style.transform;
                    const initialPosition = selectable.el.style.position;
                    // move to the final position will take the new parent offset
                    selectable.el.style.top = selectable.metrics.computedStyleRect.top + 'px';
                    selectable.el.style.left = selectable.metrics.computedStyleRect.left + 'px';
                    selectable.el.style.transform = '';
                    selectable.el.style.position = '';
                    // check for the offset and update the metrics
                    const bb = domMetrics.getBoundingBoxDocument(selectable.el);
                    const computedStyleRect = {
                        top: selectable.metrics.computedStyleRect.top + (selectable.metrics.clientRect.top - bb.top),
                        left: selectable.metrics.computedStyleRect.left + (selectable.metrics.clientRect.left - bb.left),
                        right: 0,
                        bottom: 0,
                    };
                    // restore the initial data
                    selectable.el.style.top = initialTop;
                    selectable.el.style.left = initialLeft;
                    selectable.el.style.transform = initialTransform;
                    selectable.el.style.position = initialPosition;
                    // update bottom and right
                    computedStyleRect.right = computedStyleRect.left + selectable.metrics.computedStyleRect.width;
                    computedStyleRect.bottom = computedStyleRect.top + selectable.metrics.computedStyleRect.height;
                    // update the store
                    metrics = Object.assign(Object.assign({}, selectable.metrics), { computedStyleRect: Object.assign(Object.assign({}, selectable.metrics.computedStyleRect), computedStyleRect) });
                }
                // update the store with the corrected styles
                return Object.assign(Object.assign({}, selectable), { preventMetrics: false, translation: null, metrics });
            });
            // remove the position marker
            if (this.positionMarker.parentNode)
                this.positionMarker.parentNode.removeChild(this.positionMarker);
            // update store
            this.store.dispatch(selectableState.updateSelectables(this.selection), () => {
                // change UI state while selectables metrics are simply updated
                this.store.dispatch(UiState_1.setRefreshing(true));
                // update to real metrics after drop
                const state = this.store.getState().selectables.map(selectable => {
                    return Object.assign(Object.assign({}, selectable), { metrics: domMetrics.getMetrics(selectable.el) });
                });
                this.store.dispatch(selectableState.updateSelectables(state));
                this.store.dispatch(UiState_1.setRefreshing(false));
                // update scroll
                const bb = domMetrics.getBoundingBox(this.selection);
                const initialScroll = this.store.getState().mouse.scrollData;
                const scroll = domMetrics.getScrollToShow(this.stageDocument, bb);
                if (scroll.x !== initialScroll.x || scroll.y !== initialScroll.y) {
                    this.debounceScroll(scroll);
                }
                // notify the app
                if (this.hooks.onDrop)
                    this.hooks.onDrop(this.selection);
            });
        }
        /**
         * update the destination of the absolutely positioned elements
         */
        updateDestinationAbsolute(selectable, dropZoneUnderMouse) {
            if (dropZoneUnderMouse === null) {
                // FIXME: should fallback on the body?
                console.info('no dropZone under the mouse found, how is it poussible!');
                return selectable;
            }
            else {
                return Object.assign(Object.assign({}, selectable), { dropZone: Object.assign(Object.assign({}, selectable.dropZone), { parent: dropZoneUnderMouse }) });
            }
        }
        /**
         * update the destination of the NOT absolutely positioned elements
         * and display a marker in the flow
         */
        updateDestinationNonAbsolute(selectable, nearestPosition) {
            if (nearestPosition.distance === null) {
                // FIXME: should fallback on the body?
                console.info('no nearest position found, how is it poussible?');
                return selectable;
            }
            else {
                this.markPosition(nearestPosition);
                return Object.assign(Object.assign({}, selectable), { dropZone: nearestPosition });
            }
        }
        /**
         * display the position marker atthe given positionin the dom
         */
        markPosition(position) {
            if (position.nextElementSibling) {
                position.nextElementSibling.parentNode.insertBefore(this.positionMarker, position.nextElementSibling);
            }
            else if (position.parent) {
                position.parent.appendChild(this.positionMarker);
            }
            let bbMarker = domMetrics.getBoundingBoxDocument(this.positionMarker);
            let bbTargetPrev = this.positionMarker.previousElementSibling ? domMetrics.getBoundingBoxDocument(this.positionMarker.previousElementSibling) : null;
            let bbTargetNext = this.positionMarker.nextElementSibling ? domMetrics.getBoundingBoxDocument(this.positionMarker.nextElementSibling) : null;
            if ((!bbTargetPrev || bbMarker.top >= bbTargetPrev.bottom)
                && (!bbTargetNext || bbMarker.bottom <= bbTargetNext.top)) {
                // horizontal
                this.positionMarker.style.width = bbTargetPrev ? bbTargetPrev.width + 'px' : bbTargetNext ? bbTargetNext.width + 'px' : '100%';
                this.positionMarker.style.height = '0';
            }
            else {
                // vertical
                this.positionMarker.style.height = bbTargetPrev ? bbTargetPrev.height + 'px' : bbTargetNext ? bbTargetNext.height + 'px' : '100%';
                this.positionMarker.style.width = '0';
            }
        }
        /**
         * place an empty div (phantom) at each possible place in the dom
         * find the place where it is the nearest from the mouse
         * x and y are coordinates relative to the viewport
         */
        findNearestPosition(dropZone, x, y) {
            // create an empty div to measure distance to the mouse
            let phantom = this.stageDocument.createElement('div');
            phantom.classList.add('phantom');
            // init the result to 'not found'
            let nearestPosition = {
                nextElementSibling: null,
                distance: null,
                parent: null,
            };
            for (let idx = 0; idx < dropZone.children.length; idx++) {
                let sibling = dropZone.children[idx];
                dropZone.insertBefore(phantom, sibling);
                let distance = this.getDistance(phantom, x, y);
                if (nearestPosition.distance === null || nearestPosition.distance > distance) {
                    nearestPosition.nextElementSibling = sibling;
                    nearestPosition.parent = dropZone;
                    nearestPosition.distance = distance;
                }
                dropZone.removeChild(phantom);
            }
            // test the last position
            dropZone.appendChild(phantom);
            let distance = this.getDistance(phantom, x, y);
            if (nearestPosition.distance === null || nearestPosition.distance > distance) {
                nearestPosition.nextElementSibling = null;
                nearestPosition.parent = dropZone;
                nearestPosition.distance = distance;
            }
            dropZone.removeChild(phantom);
            // the next element can not be our position marker (it happens)
            if (nearestPosition.nextElementSibling === this.positionMarker)
                nearestPosition.nextElementSibling = this.positionMarker.nextElementSibling;
            return nearestPosition;
        }
        /**
         * get the distance from el's center to (x, y)
         * x and y are relative to the viewport
         */
        getDistance(el, x, y) {
            const bb = el.getBoundingClientRect();
            const center = {
                x: bb.left + (bb.width / 2),
                y: bb.top + (bb.height / 2),
            };
            return Math.sqrt(((center.x - x) * (center.x - x)) + ((center.y - y) * (center.y - y)));
        }
    }
    exports.MoveHandler = MoveHandler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZUhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdHMvaGFuZGxlcnMvTW92ZUhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVNhLFFBQUEsaUJBQWlCLEdBQUcsRUFBRSxDQUFDO0lBRXBDLE1BQWEsV0FBWSxTQUFRLG1DQUFnQjtRQUsvQyxZQUFZLGFBQTJCLEVBQUUsZUFBNkIsRUFBRSxLQUFpQixFQUFFLEtBQVk7WUFDckcsS0FBSyxDQUFDLGFBQWEsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRXBELCtCQUErQjtZQUMvQix5REFBeUQ7WUFDekQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUztpQkFDOUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztpQkFDeEIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsMkJBQTJCLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRW5FLGlCQUFpQjtZQUNqQixJQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVc7Z0JBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXBFLHdEQUF3RDtZQUN4RCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxtQkFBbUIsQ0FBQztZQUNoRSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdB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