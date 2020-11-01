define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DomObserver = exports.removeDomObserver = exports.addDomObserver = exports.resetDomObservers = exports.initDomObservers = exports.domObservers = void 0;
    ;
    // dom observers instances, exposed for unit tests
    exports.domObservers = new Map();
    function initDomObservers(elements, onChanged) {
        resetDomObservers();
        elements.forEach((el) => addDomObserver(el, onChanged));
    }
    exports.initDomObservers = initDomObservers;
    ;
    function resetDomObservers() {
        Array.from(exports.domObservers.keys())
            .forEach((el) => removeDomObserver(el));
    }
    exports.resetDomObservers = resetDomObservers;
    ;
    function addDomObserver(el, onChanged) {
        if (typeof ResizeObserver === 'undefined') {
            throw new Error('ResizeObserver is not supported by your browser. The drag and drop features will not work properly');
        }
        if (exports.domObservers.has(el)) {
            removeDomObserver(el);
        }
        const resizeObserver = new ResizeObserver(onChanged);
        resizeObserver.observe(el, {});
        const mutationObserver = new MutationObserver(onChanged);
        // FIXME: mutation observer is disabled => remove useless mutationObserver
        // mutationObserver.observe(el, {
        //   subtree: true,
        //   childList: true,
        //   attributes: true,
        //   attributeOldValue: false,
        //   characterData: true,
        //   characterDataOldValue: false,
        // });
        exports.domObservers.set(el, { mutationObserver, resizeObserver });
    }
    exports.addDomObserver = addDomObserver;
    ;
    function removeDomObserver(el) {
        if (exports.domObservers.has(el)) {
            const { mutationObserver, resizeObserver } = exports.domObservers.get(el);
            resizeObserver.disconnect();
            mutationObserver.disconnect();
            mutationObserver.takeRecords();
            exports.domObservers.delete(el);
        }
        else {
            throw new Error('DOM observer not found for this DOM element');
        }
    }
    exports.removeDomObserver = removeDomObserver;
    ;
    /**
     * @class This class listens to the store
     *   and observe the dom elements in order to keep the metrics in sync
     *   using MutationObserver and ResizeObserver APIs of the browser
     */
    class DomObserver {
        constructor(store, cbk) {
            this.cbk = cbk;
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
            //   this.onStateChanged()
            // }
        }
        cleanup() {
            this.unsubscribeAll.forEach(u => u());
            resetDomObservers();
        }
        onRemoved(state) {
            removeDomObserver(state.el);
        }
        onAdded(state) {
            addDomObserver(state.el, (entries) => this.onChanged(state, entries));
        }
        onChanged(state, entries) {
            this.cbk(state, entries);
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
                const added = state.filter(s => !prevState.find(s2 => s2.el === s.el));
                added.forEach((state) => this.onAdded(state));
                const removed = prevState.filter(s => !state.find(s2 => s2.el === s.el));
                removed.forEach((state) => this.onRemoved(state));
            }
        }
    }
    exports.DomObserver = DomObserver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG9tT2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdHMvb2JzZXJ2ZXJzL0RvbU9ic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFTQyxDQUFDO0lBRUYsa0RBQWtEO0lBQ3JDLFFBQUEsWUFBWSxHQUFHLElBQUksR0FBRyxFQUFxRixDQUFDO0lBQ3pILFNBQWdCLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxTQUFTO1FBQ2xELGlCQUFpQixFQUFFLENBQUM7UUFDcEIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFIRCw0Q0FHQztJQUFBLENBQUM7SUFFRixTQUFnQixpQkFBaUI7UUFDL0IsS0FBSyxDQUFDLElBQUksQ0FBQyxvQkFBWSxDQUFDLElBQUksRUFBRSxDQUFDO2FBQzlCLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBSEQsOENBR0M7SUFBQSxDQUFDO0lBRUYsU0FBZ0IsY0FBYyxDQUFDLEVBQWUsRUFBRSxTQUF3QztRQUN0RixJQUFJLE9BQU8sY0FBYyxLQUFLLFdBQVcsRUFBRTtZQUN6QyxNQUFNLElBQUksS0FBSyxDQUFDLG9HQUFvRyxDQUFDLENBQUM7U0FDdkg7UUFDRCxJQUFJLG9CQUFZLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ3hCLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsTUFBTSxjQUFjLEdBQUcsSUFBSSxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDckQsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFL0IsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGdCQUFn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