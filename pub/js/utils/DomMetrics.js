define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.move = exports.findSelectableUnderMouse = exports.findDropZonesUnderMouse = exports.fromClientToComputed = exports.hasASelectedDraggableParent = exports.getSelectable = exports.getSelection = exports.getSelectableState = exports.getCursorData = exports.isResizeable = exports.getResizeCursorClass = exports.getDirection = exports.CURSOR_S = exports.CURSOR_N = exports.CURSOR_E = exports.CURSOR_W = exports.CURSOR_SE = exports.CURSOR_SW = exports.CURSOR_NE = exports.CURSOR_NW = exports.CURSOR_MOVE = exports.CURSOR_SELECT = exports.CURSOR_DEFAULT = exports.setScroll = exports.getScrollBarSize = exports.getScroll = exports.getMetrics = exports.setMetrics = exports.getDocument = exports.getWindow = exports.getScrollToShow = exports.SCROLL_ZONE_SIZE = exports.getBoundingBox = exports.getBoundingBoxDocument = void 0;
    /**
     * get the bounding box of an element relative to the document, not the viewport (unlike el.getBoundingClientRect())
     */
    function getBoundingBoxDocument(el) {
        const doc = getDocument(el);
        const scroll = getScroll(doc);
        const box = el.getBoundingClientRect();
        return {
            top: box.top + scroll.y,
            left: box.left + scroll.x,
            bottom: box.bottom + scroll.y,
            right: box.right + scroll.x,
            width: box.width,
            height: box.height,
        };
    }
    exports.getBoundingBoxDocument = getBoundingBoxDocument;
    /**
     * get the bounding box of several elements
     * relative to the the document
     */
    function getBoundingBox(selectables) {
        const box = {
            top: Infinity,
            left: Infinity,
            bottom: -Infinity,
            right: -Infinity,
            width: 0,
            height: 0,
        };
        selectables.forEach(s => {
            const rect = fromClientToComputed(s.metrics);
            box.top = Math.min(box.top, rect.top);
            box.left = Math.min(box.left, rect.left);
            box.bottom = Math.max(box.bottom, rect.top + rect.height);
            box.right = Math.max(box.right, rect.left + rect.width);
        });
        return Object.assign(Object.assign({}, box), { width: box.right - box.left, height: box.bottom - box.top });
    }
    exports.getBoundingBox = getBoundingBox;
    exports.SCROLL_ZONE_SIZE = 0;
    /**
     * get the ideal scroll in order to have boundingBox visible
     * boundingBox is expected to be relative to the document, not the viewport
     */
    function getScrollToShow(doc, boundingBox) {
        const scroll = getScroll(doc);
        const win = getWindow(doc);
        // vertical
        if (win.innerHeight < boundingBox.height) {
            // element bigger than viewport
            if (scroll.y + win.innerHeight < boundingBox.top || scroll.y > boundingBox.bottom) {
                // not visible => scroll to top
                scroll.y = boundingBox.top - exports.SCROLL_ZONE_SIZE;
            }
            else {
                // partly visible => do not scroll at all
            }
        }
        // if(scroll.y > boundingBox.top - SCROLL_ZONE_SIZE) {
        else if (scroll.y > boundingBox.top) {
            // element is up the viewport
            scroll.y = boundingBox.top - exports.SCROLL_ZONE_SIZE;
        }
        // else if(scroll.y < boundingBox.bottom + SCROLL_ZONE_SIZE - win.innerHeight) {
        else if (scroll.y < boundingBox.bottom - win.innerHeight) {
            // element is lower than the viewport
            scroll.y = boundingBox.bottom + exports.SCROLL_ZONE_SIZE - win.innerHeight;
        }
        // horizontal
        if (win.innerWidth < boundingBox.width) {
            // element bigger than viewport
            if (scroll.x + win.innerWidth < boundingBox.left || scroll.x > boundingBox.right) {
                // not visible => scroll to left 
                scroll.x = boundingBox.left - exports.SCROLL_ZONE_SIZE;
            }
            else {
                // partly visible => do not scroll at all
            }
        }
        // if(scroll.x > boundingBox.left - SCROLL_ZONE_SIZE) {
        else if (scroll.x > boundingBox.left) {
            scroll.x = boundingBox.left - exports.SCROLL_ZONE_SIZE;
        }
        // else if(scroll.x < boundingBox.right + SCROLL_ZONE_SIZE - win.innerWidth) {
        else if (scroll.x < boundingBox.right - win.innerWidth) {
            scroll.x = boundingBox.right + exports.SCROLL_ZONE_SIZE - win.innerWidth;
        }
        return {
            x: Math.max(0, scroll.x),
            y: Math.max(0, scroll.y),
        };
    }
    exports.getScrollToShow = getScrollToShow;
    /**
     * retrieve the document's window
     * @param {HTMLDocument} doc
     * @return {Window}
     */
    function getWindow(doc) {
        return doc['parentWindow'] || doc.defaultView;
    }
    exports.getWindow = getWindow;
    /**
     * retrieve the document which holds this element
     * @param {HTMLElement} el
     * @return {HTMLDocument}
     */
    function getDocument(el) {
        return el.ownerDocument;
    }
    exports.getDocument = getDocument;
    /**
     * @param {HTMLElement} el
     */
    function setMetrics(el, metrics, useMinHeight, useClientRect = false) {
        const doc = getDocument(el);
        const win = getWindow(doc);
        const style = win.getComputedStyle(el);
        const position = style.getPropertyValue('position');
        // handle position
        if (position !== metrics.position) {
            el.style.position = metrics.position;
        }
        // handle DOM metrics
        function updateStyle(objName, propName, styleName) {
            const styleValue = metrics[objName][propName];
            if ((parseInt(style.getPropertyValue(objName + '-' + propName)) || 0) !== styleValue) {
                el.style[styleName] = styleValue + 'px';
            }
        }
        if (useClientRect) {
            const computedStyleRect = fromClientToComputed(metrics);
            if (metrics.position !== 'static') {
                el.style.top = computedStyleRect.top + 'px';
                el.style.left = computedStyleRect.left + 'px';
            }
            el.style.width = computedStyleRect.width + 'px';
            el.style[useMinHeight ? 'minHeight' : 'height'] = computedStyleRect.height + 'px';
        }
        else {
            if (metrics.position !== 'static') {
                updateStyle('computedStyleRect', 'top', 'top');
                updateStyle('computedStyleRect', 'left', 'left');
            }
            updateStyle('computedStyleRect', 'width', 'width');
            updateStyle('computedStyleRect', 'height', useMinHeight ? 'minHeight' : 'height');
        }
        updateStyle('margin', 'top', 'marginTop');
        updateStyle('margin', 'left', 'marginLeft');
        updateStyle('margin', 'bottom', 'marginBottom');
        updateStyle('margin', 'right', 'marginRight');
        updateStyle('padding', 'top', 'paddingTop');
        updateStyle('padding', 'left', 'paddingLeft');
        updateStyle('padding', 'bottom', 'paddingBottom');
        updateStyle('padding', 'right', 'paddingRight');
        updateStyle('border', 'top', 'borderTopWidth');
        updateStyle('border', 'left', 'borderLeftWidth');
        updateStyle('border', 'bottom', 'borderBottomWidth');
        updateStyle('border', 'right', 'borderRightWidth');
    }
    exports.setMetrics = setMetrics;
    /**
     * @param {HTMLElement} el
     * @return {ElementMetrics} the element metrics
     */
    function getMetrics(el) {
        const doc = getDocument(el);
        const win = getWindow(doc);
        const style = win.getComputedStyle(el);
        const clientRect = getBoundingBoxDocument(el);
        return {
            position: style.getPropertyValue('position'),
            proportions: clientRect.height / (clientRect.width || .000000000001),
            computedStyleRect: {
                width: parseInt(style.getPropertyValue('width')) || 0,
                height: parseInt(style.getPropertyValue('height')) || 0,
                left: parseInt(style.getPropertyValue('left')) || 0,
                top: parseInt(style.getPropertyValue('top')) || 0,
                bottom: parseInt(style.getPropertyValue('bottom')) || 0,
                right: parseInt(style.getPropertyValue('right')) || 0,
            },
            border: {
                left: parseInt(style.getPropertyValue('border-left-width')) || 0,
                top: parseInt(style.getPropertyValue('border-top-width')) || 0,
                right: parseInt(style.getPropertyValue('border-right-width')) || 0,
                bottom: parseInt(style.getPropertyValue('border-bottom-width')) || 0,
            },
            padding: {
                left: parseInt(style.getPropertyValue('padding-left')) || 0,
                top: parseInt(style.getPropertyValue('padding-top')) || 0,
                right: parseInt(style.getPropertyValue('padding-right')) || 0,
                bottom: parseInt(style.getPropertyValue('padding-bottom')) || 0,
            },
            margin: {
                left: parseInt(style.getPropertyValue('margin-left')) || 0,
                top: parseInt(style.getPropertyValue('margin-top')) || 0,
                right: parseInt(style.getPropertyValue('margin-right')) || 0,
                bottom: parseInt(style.getPropertyValue('margin-bottom')) || 0,
            },
            clientRect: {
                top: clientRect.top,
                left: clientRect.left,
                bottom: clientRect.bottom,
                right: clientRect.right,
                width: clientRect.width,
                height: clientRect.height,
            },
        };
    }
    exports.getMetrics = getMetrics;
    /**
     * @param {HTMLDocument} doc
     * @return {ScrollData} the scroll state for the document
     */
    function getScroll(doc) {
        const win = getWindow(doc);
        return {
            x: win.scrollX,
            y: win.scrollY,
        };
    }
    exports.getScroll = getScroll;
    function getScrollBarSize() {
        // Create the measurement node
        var scrollDiv = document.createElement("div");
        scrollDiv.style.width = '100px';
        scrollDiv.style.height = '100px';
        scrollDiv.style.overflow = 'scroll';
        scrollDiv.style.position = 'absolute';
        scrollDiv.style.top = '-9999px';
        document.body.appendChild(scrollDiv);
        // Get the scrollbar width
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        // Delete the DIV
        document.body.removeChild(scrollDiv);
        return scrollbarWidth;
    }
    exports.getScrollBarSize = getScrollBarSize;
    /**
     * @param {HTMLDocument} doc
     * @param {ScrollData} scroll, the scroll state for the document
     */
    function setScroll(doc, scroll) {
        const win = getWindow(doc);
        win.scroll(scroll.x, scroll.y);
    }
    exports.setScroll = setScroll;
    const BORDER_SIZE = 10;
    exports.CURSOR_DEFAULT = 'default';
    exports.CURSOR_SELECT = 'pointer';
    exports.CURSOR_MOVE = 'move';
    exports.CURSOR_NW = 'nw-resize';
    exports.CURSOR_NE = 'ne-resize';
    exports.CURSOR_SW = 'sw-resize';
    exports.CURSOR_SE = 'se-resize';
    exports.CURSOR_W = 'w-resize';
    exports.CURSOR_E = 'e-resize';
    exports.CURSOR_N = 'n-resize';
    exports.CURSOR_S = 's-resize';
    // check if the mouse is on the side of the selectable
    // this happens only when the mouse is over the selectable
    function getDirection(clientX, clientY, scrollData, selectable) {
        const bb = selectable.metrics.clientRect;
        const distFromBorder = {
            left: clientX + scrollData.x - bb.left,
            right: bb.width + bb.left - (clientX + scrollData.x),
            top: clientY + scrollData.y - bb.top,
            bottom: bb.height + bb.top - (clientY + scrollData.y),
        };
        // get resize direction
        const direction = { x: '', y: '' };
        if (distFromBorder.left < BORDER_SIZE)
            direction.x = 'left';
        else if (distFromBorder.right < BORDER_SIZE)
            direction.x = 'right';
        if (distFromBorder.top < BORDER_SIZE)
            direction.y = 'top';
        else if (distFromBorder.bottom < BORDER_SIZE)
            direction.y = 'bottom';
        return direction;
    }
    exports.getDirection = getDirection;
    function getResizeCursorClass(direction) {
        if (direction.x === 'left' && direction.y === 'top')
            return exports.CURSOR_NW;
        else if (direction.x === 'right' && direction.y === 'top')
            return exports.CURSOR_NE;
        else if (direction.x === 'left' && direction.y === 'bottom')
            return exports.CURSOR_SW;
        else if (direction.x === 'right' && direction.y === 'bottom')
            return exports.CURSOR_SE;
        else if (direction.x === 'left' && direction.y === '')
            return exports.CURSOR_W;
        else if (direction.x === 'right' && direction.y === '')
            return exports.CURSOR_E;
        else if (direction.x === '' && direction.y === 'top')
            return exports.CURSOR_N;
        else if (direction.x === '' && direction.y === 'bottom')
            return exports.CURSOR_S;
        throw new Error('direction not found');
    }
    exports.getResizeCursorClass = getResizeCursorClass;
    function isResizeable(resizeable, direction) {
        if (typeof resizeable === 'object') {
            return (direction.x !== '' || direction.y !== '') && [
                { x: 'left', y: 'top' },
                { x: 'right', y: 'top' },
                { x: 'left', y: 'bottom' },
                { x: 'right', y: 'bottom' },
            ].reduce((prev, dir) => {
                const res = prev || (((resizeable[dir.x] && direction.x === dir.x) || direction.x === '') &&
                    ((resizeable[dir.y] && direction.y === dir.y) || direction.y === ''));
                return res;
            }, false);
        }
        else {
            return direction.x !== '' || direction.y !== '';
        }
    }
    exports.isResizeable = isResizeable;
    function getCursorData(clientX, clientY, scrollData, selectable) {
        if (selectable) {
            const direction = getDirection(clientX, clientY, scrollData, selectable);
            if (isResizeable(selectable.resizeable, direction)) {
                return {
                    x: direction.x,
                    y: direction.y,
                    cursorType: getResizeCursorClass(direction),
                };
            }
            else if (selectable.draggable) {
                return {
                    x: '',
                    y: '',
                    cursorType: exports.CURSOR_MOVE,
                };
            }
            else if (selectable.selected) {
                return {
                    x: '',
                    y: '',
                    cursorType: exports.CURSOR_SELECT,
                };
            }
            else {
                return {
                    x: '',
                    y: '',
                    cursorType: exports.CURSOR_DEFAULT,
                };
            }
        }
        else {
            return {
                x: '',
                y: '',
                cursorType: exports.CURSOR_DEFAULT,
            };
        }
    }
    exports.getCursorData = getCursorData;
    /**
     * retrive the state for this element
     */
    function getSelectableState(store, el) {
        return store.getState().selectables.find(selectable => selectable.el === el);
    }
    exports.getSelectableState = getSelectableState;
    /**
     * helper to get the states of the selected elements
     */
    function getSelection(store) {
        return store.getState().selectables.filter(selectable => selectable.selected);
    }
    exports.getSelection = getSelection;
    /**
     * returns the state of the first container which is selectable
     * or null if the element and none of its parents are selectable
     */
    function getSelectable(store, element) {
        let el = element;
        let data;
        while (!!el && !(data = getSelectableState(store, el))) {
            el = el.parentElement;
        }
        return data;
    }
    exports.getSelectable = getSelectable;
    /**
     * check if an element has a parent which is selected and draggable
     * @param {HTMLElement} selectable
     */
    function hasASelectedDraggableParent(store, el) {
        const selectableParent = getSelectable(store, el.parentElement);
        if (selectableParent) {
            if (selectableParent.selected && selectableParent.draggable)
                return true;
            else
                return hasASelectedDraggableParent(store, selectableParent.el);
        }
        else {
            return false;
        }
    }
    exports.hasASelectedDraggableParent = hasASelectedDraggableParent;
    /**
     *
     * @param {ElementMetrics} metrics
     * @return {string} get the computedStyleRect that matches metrics.clientRect
     */
    function fromClientToComputed(metrics) {
        return {
            top: Math.round(metrics.clientRect.top + metrics.margin.top),
            left: Math.round(metrics.clientRect.left + metrics.margin.left),
            right: Math.round(metrics.clientRect.right + metrics.margin.left + metrics.padding.left + metrics.padding.right + metrics.border.left + metrics.border.right - (metrics.border.left + metrics.border.right)),
            bottom: Math.round(metrics.clientRect.bottom + metrics.margin.top + metrics.padding.top + metrics.padding.bottom + metrics.border.top + metrics.border.bottom - (metrics.border.top + metrics.border.bottom)),
            width: Math.round(metrics.clientRect.width + metrics.padding.left + metrics.padding.right + metrics.border.left + metrics.border.right - 2 * (metrics.border.left + metrics.border.right)),
            height: Math.round(metrics.clientRect.height + metrics.border.top + metrics.border.bottom + metrics.padding.top + metrics.padding.bottom - 2 * (metrics.border.top + metrics.border.bottom)),
        };
    }
    exports.fromClientToComputed = fromClientToComputed;
    /**
     * find the dropZone elements which are under the mouse
     * the first one in the list is the top most one
     * x and y are relative to the viewport, not the document
     */
    function findDropZonesUnderMouse(doc, store, hooks, x, y) {
        const win = getWindow(doc);
        // constrain the coord inside the viewport (otherwise elementsFromPoint will return null)
        const constrain = (num, min, max) => Math.min(Math.max(num, min), max);
        const safeX = constrain(x, 0, win.innerWidth - 1);
        const safeY = constrain(y, 0, win.innerHeight - 1);
        const selectables = store.getState().selectables;
        const selection = selectables.filter(s => s.selected);
        // get a list of all dropZone zone under the point (x, y)
        return doc.elementsFromPoint(safeX, safeY)
            .filter((el) => {
            const selectable = selectables.find(s => s.el === el);
            return selectable
                && selectable.isDropZone
                && !selection.find(s => s.el === el);
        });
    }
    exports.findDropZonesUnderMouse = findDropZonesUnderMouse;
    function findSelectableUnderMouse(doc, store, x, y) {
        const win = getWindow(doc);
        // constrain the coord inside the viewport (otherwise elementsFromPoint will return null)
        const constrain = (num, min, max) => Math.min(Math.max(num, min), max);
        const safeX = constrain(x, 0, win.innerWidth - 1);
        const safeY = constrain(y, 0, win.innerHeight - 1);
        const selectables = store.getState().selectables;
        return doc.elementsFromPoint(safeX, safeY)
            .filter((el) => !!selectables.find(s => s.el === el));
    }
    exports.findSelectableUnderMouse = findSelectableUnderMouse;
    /**
     * move an element and update its data in selection
     * when elements are in a container which is moved, the clientRect changes but not the computedStyleRect
     */
    function move(selectable, onlyClientRect, movementX, movementY) {
        return Object.assign(Object.assign({}, selectable), { translation: selectable.translation ? {
                x: selectable.translation.x + movementX,
                y: selectable.translation.y + movementY,
            } : null, metrics: Object.assign(Object.assign({}, selectable.metrics), { clientRect: Object.assign(Object.assign({}, selectable.metrics.clientRect), { top: selectable.metrics.clientRect.top + movementY, left: selectable.metrics.clientRect.left + movementX, bottom: selectable.metrics.clientRect.bottom + movementY, right: selectable.metrics.clientRect.right + movementX }), computedStyleRect: onlyClientRect ? selectable.metrics.computedStyleRect : Object.assign(Object.assign({}, selectable.metrics.computedStyleRect), { top: selectable.metrics.computedStyleRect.top + movementY, left: selectable.metrics.computedStyleRect.left + movementX, bottom: selectable.metrics.computedStyleRect.bottom + movementY, right: selectable.metrics.computedStyleRect.right + movementX }) }) });
    }
    exports.move = move;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG9tTWV0cmljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy91dGlscy9Eb21NZXRyaWNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFHQTs7T0FFRztJQUNILFNBQWdCLHNCQUFzQixDQUFDLEVBQWU7UUFDcEQsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUN2QyxPQUFPO1lBQ0wsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFDdkIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFDekIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFDN0IsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFDM0IsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLO1lBQ2hCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtTQUNuQixDQUFBO0lBQ0gsQ0FBQztJQVpELHdEQVlDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBZ0IsY0FBYyxDQUFDLFdBQXlDO1FBQ3RFLE1BQU0sR0FBRyxHQUFlO1lBQ3RCLEdBQUcsRUFBRSxRQUFRO1lBQ2IsSUFBSSxFQUFFLFFBQVE7WUFDZCxNQUFNLEVBQUUsQ0FBQyxRQUFRO1lBQ2pCLEtBQUssRUFBRSxDQUFDLFFBQVE7WUFDaEIsS0FBSyxFQUFFLENBQUM7WUFDUixNQUFNLEVBQUUsQ0FBQztTQUNWLENBQUE7UUFDRCxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3RCLE1BQU0sSUFBSSxHQUFrQixvQkFBb0IsQ0FBQyxDQUFDLENB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