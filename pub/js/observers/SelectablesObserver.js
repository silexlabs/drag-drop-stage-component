define(["require", "exports", "../utils/DomMetrics"], function (require, exports, DomMetrics) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SelectablesObserver = void 0;
    /**
     * @class This class listens to the store
     *   and apply the state changes to the DOM elements
     */
    class SelectablesObserver {
        constructor(stageDocument, overlayDocument, store, hooks) {
            this.stageDocument = stageDocument;
            this.overlayDocument = overlayDocument;
            this.store = store;
            this.hooks = hooks;
            this.isRefreshing = false;
            this.state = [];
            this.prevState = [];
            this.unsubscribeAll = [];
            this.unsubscribeAll.push(store.subscribe((state, prevState) => this.onStateChanged(state, prevState), (state) => state.selectables), store.subscribe((state, prevState) => this.onUiChanged(state, prevState), (state) => state.ui));
        }
        onUiChanged(state, prevState) {
            this.isRefreshing = state.refreshing;
            // // update after refresh (bug because isRefreshing is turned on and off many times)
            // if (state.refreshing !== prevState.refreshing && state.refreshing === false) {
            //   this.onStateChanged(this.state, this.prevState)
            // }
        }
        cleanup() {
            this.unsubscribeAll.forEach(u => u());
        }
        /**
         * handle state changes, detect changes of scroll or metrics or selection
         * @param {State} state
         * @param {State} prevState the old state obj
         */
        onStateChanged(state = this.state, prevState = this.prevState) {
            this.state = state;
            if (!this.isRefreshing) {
                this.prevState = prevState;
                // select selectables which have changed
                const filterBy = (propName, selectable) => {
                    const oldSelectable = prevState.find(old => selectable.el === old.el);
                    // FIXME: use JSON.stringify to compare?
                    return !oldSelectable || JSON.stringify(oldSelectable[propName]) !== JSON.stringify(selectable[propName]);
                    // return !oldSelectable || oldSelectable[propName] !== selectable[propName];
                };
                const removed = prevState.filter(s => !state.find(s2 => s2.el === s.el));
                const metrics = state.filter(selectable => filterBy('metrics', selectable));
                if (removed.length + metrics.length > 0)
                    this.onMetrics(metrics, removed);
                const selection = state.filter(selectable => filterBy('selected', selectable));
                if (selection.length > 0)
                    this.onSelection(selection);
                // const draggable = state.filter(selectable => filterBy('draggable', selectable));
                // if(draggable.length > 0) this.onDraggable(draggable);
                // const resizeable = state.filter(selectable => filterBy('resizeable', selectable));
                // if(resizeable.length > 0) this.onResizeable(resizeable);
                // const isDropZone = state.filter(selectable => filterBy('isDropZone', selectable));
                // if(isDropZone.length > 0) this.onDropZone(isDropZone);
                const translation = state.filter(selectable => filterBy('translation', selectable));
                if (translation.length > 0)
                    this.onTranslation(translation);
            }
        }
        // update elements position and size
        onMetrics(selectables, removed) {
            selectables.forEach(selectable => {
                // while being dragged, elements are out of the flow, do not apply styles
                if (!selectable.preventMetrics) {
                    DomMetrics.setMetrics(selectable.el, selectable.metrics, selectable.useMinHeight);
                }
            });
            // notify the app
            if (this.hooks.onChange)
                this.hooks.onChange(selectables.concat(removed));
        }
        onSelection(selectables) {
            // notify the app
            if (this.hooks.onSelect)
                this.hooks.onSelect(selectables);
        }
        // onDraggable(selectables: Array<SelectableState>) {}
        // onResizeable(selectables: Array<SelectableState>) {}
        // onDropZone(selectables: Array<SelectableState>) {}
        onTranslation(selectables) {
            selectables.forEach(selectable => {
                if (!!selectable.translation) {
                    selectable.el.style.transform = `translate(${selectable.translation.x}px, ${selectable.translation.y}px)`;
                    selectable.el.style.zIndex = '99999999';
                    if (selectable.metrics.position === 'static') {
                        selectable.el.style.top = '0';
                        selectable.el.style.left = '0';
                        selectable.el.style.position = 'relative';
                    }
                }
                else {
                    selectable.el.style.transform = '';
                    selectable.el.style.zIndex = '';
                    selectable.el.style.position = '';
                }
            });
        }
    }
    exports.SelectablesObserver = SelectablesObserver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VsZWN0YWJsZXNPYnNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy9vYnNlcnZlcnMvU2VsZWN0YWJsZXNPYnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBS0E7OztPQUdHO0lBQ0gsTUFBYSxtQkFBbUI7UUFDOUIsWUFBb0IsYUFBMkIsRUFBVSxlQUE2QixFQUFVLEtBQWlCLEVBQVUsS0FBa0I7WUFBekgsa0JBQWEsR0FBYixhQUFhLENBQWM7WUFBVSxvQkFBZSxHQUFmLGVBQWUsQ0FBYztZQUFVLFVBQUssR0FBTCxLQUFLLENBQVk7WUFBVSxVQUFLLEdBQUwsS0FBSyxDQUFhO1lBYXJJLGlCQUFZLEdBQVksS0FBSyxDQUFDO1lBQzlCLFVBQUssR0FBMkIsRUFBRSxDQUFBO1lBQ2xDLGNBQVMsR0FBMkIsRUFBRSxDQUFBO1lBU3RDLG1CQUFjLEdBQXNCLEVBQUUsQ0FBQztZQXZCN0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQ3RCLEtBQUssQ0FBQyxTQUFTLENBQ2IsQ0FBQyxLQUE2QixFQUFFLFNBQWlDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxFQUMzRyxDQUFDLEtBQWlCLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQ3pDLEVBQ0QsS0FBSyxDQUFDLFNBQVMsQ0FDYixDQUFDLEtBQW9CLEVBQUUsU0FBd0IsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQ3RGLENBQUMsS0FBaUIsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FDaEMsQ0FDRixDQUFDO1FBQ0osQ0FBQztRQUtELFdBQVcsQ0FBQyxLQUFvQixFQUFFLFNBQXdCO1lBQ3hELElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztZQUNyQyxxRkFBcUY7WUFD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