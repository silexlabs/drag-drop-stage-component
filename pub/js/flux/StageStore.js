define(["require", "exports", "redux", "./SelectionState", "./UiState", "./MouseState", "./SelectableState"], function (require, exports, redux_1, SelectionState_1, UiState_1, mouseState, selectableState) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StageStore = void 0;
    class StageStore {
        constructor() {
            /**
             * the main redux store
             * @type {Store}
             */
            this.store = StageStore.createStore();
        }
        [Symbol.observable]() {
            return this;
        }
        ;
        /**
         * Create a redux store with composed reducers
         * @return Store
         */
        static createStore() {
            const reducer = redux_1.combineReducers({
                selectables: (state, action) => selectableState.selectables(SelectionState_1.selection(state, action), action),
                ui: (state, action) => UiState_1.ui(state, action),
                mouse: (state, action) => mouseState.mouse(state, action),
            });
            return redux_1.createStore(reducer, redux_1.applyMiddleware(StageStore.preventDispatchDuringRedraw));
        }
        ;
        // this is unused for now, I used the "refreshing" prop instead, on state.ui
        static preventDispatchDuringRedraw({ getState }) {
            return next => action => {
                if (action.preventDispatch) {
                    console.warn('prevent dispatch', action);
                }
                else {
                    const returnValue = next(action);
                    return returnValue;
                }
                return null;
            };
        }
        /**
         * Subscribe to state changes with the ability to filter by substate
         * @param onChange callback to get the state and the previous state
         * @param select method to select the sub state
         * @return {function()} function to call to unsubscribe
         */
        subscribe(onChange, select = (state) => state) {
            let currentState = select(this.store.getState());
            const handleChange = () => {
                let nextState = select(this.store.getState());
                if (nextState !== currentState) {
                    let prevState = currentState;
                    currentState = nextState;
                    onChange(currentState, prevState);
                }
            };
            return this.store.subscribe(handleChange);
        }
        // clone the object, not deep
        clone(obj) {
            let res;
            if (obj instanceof Array)
                res = obj.slice();
            else if (obj instanceof Object)
                res = Object.assign({}, obj);
            else
                res = obj;
            if (obj === res)
                throw 'not cloned';
            return res;
        }
        dispatch(action, cbk = null) {
            this.store.dispatch(action);
            if (cbk)
                cbk();
            return null;
        }
        getState() {
            return this.store.getState();
        }
        replaceReducer() {
            throw new Error('not implemented');
        }
    }
    exports.StageStore = StageStore;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhZ2VTdG9yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy9mbHV4L1N0YWdlU3RvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVFBLE1BQWEsVUFBVTtRQUF2QjtZQWdDRTs7O2VBR0c7WUFDTyxVQUFLLEdBQWlCLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQTJDM0QsQ0FBQztRQTlFQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDakIsT0FBTyxJQUFnQyxDQUFDO1FBQzFDLENBQUM7UUFBQSxDQUFDO1FBQ0Y7OztXQUdHO1FBQ08sTUFBTSxDQUFDLFdBQVc7WUFFMUIsTUFBTSxPQUFPLEdBQUcsdUJBQWUsQ0FBQztnQkFDOUIsV0FBVyxFQUFFLENBQUMsS0FBNkIsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsMEJBQVMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDO2dCQUNySCxFQUFFLEVBQUUsQ0FBQyxLQUFjLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxZQUFFLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQztnQkFDakQsS0FBSyxFQUFFLENBQUMsS0FBaUIsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQzthQUN0RSxDQUFDLENBQUM7WUFDSCxPQUFPLG1CQUFXLENBQUMsT0FBTyxFQUFFLHVCQUFlLENBQUMsVUFBVSxDQUFDLDJCQUEyQixDQUFDLENBQWlCLENBQUM7UUFDdkcsQ0FBQztRQUFBLENBQUM7UUFFRiw0RUFBNEU7UUFDcEUsTUFBTSxDQUFDLDJCQUEyQixDQUFDLEVBQUUsUUFBUSxFQUFFO1lBQ3JELE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDdEIsSUFBSSxNQUFNLENBQUMsZUFBZSxFQUFFO29CQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFBO2lCQUN6QztxQkFDSTtvQkFDSCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7b0JBQ2hDLE9BQU8sV0FBVyxDQUFBO2lCQUNuQjtnQkFDRCxPQUFPLElBQUksQ0FBQztZQUNkLENBQUMsQ0FBQTtRQUNILENBQUM7UUFRRDs7Ozs7V0FLRztRQUNILFNBQVMsQ0FBVyxRQUFzRCxFQUFFLFNBQU8sQ0FBQyxLQUFXLEVBQVcsRUFBRSxDQUFFLEtBQWE7WUFDekgsSUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUVqRCxNQUFNLFlBQVksR0FBRyxHQUFHLEVBQUU7Z0JBQ3hCLElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQzlDLElBQUksU0FBUyxLQUFLLFlBQVksRUFBRTtvQkFDOUIsSUFBSSxTQUFTLEdBQUcsWUFBWSxDQUFDO29CQUM3QixZQUFZLEdBQUcsU0FBUyxDQUFDO29CQUN6QixRQUFRLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2lCQUNuQztZQUNILENBQUMsQ0FBQTtZQUNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUNELDZCQUE2QjtRQUM3QixLQUFLLENBQVcsR0FBYTtZQUMzQixJQUFJLEdBQVEsQ0FBQztZQUNiLElBQUcsR0FBRyxZQUFZLEtBQUs7Z0JBQUUsR0FBRyxHQUFJLEdBQWtCLENBQUMsS0FBSyxFQUFxQixDQUFDO2lCQUN6RSxJQUFHLEdBQUcsWUFBWSxNQUFNO2dCQUFFLEdBQUcsR0FBRyxrQkFDN0IsR0FBcUIsQ0FDZCxDQUFDOztnQkFDWCxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQ2YsSUFBRyxHQUFHLEtBQUssR0FBRztnQkFBRSxNQUFNLFlBQVksQ0FBQztZQUNuQyxPQUFPLEdBQUcsQ0FBQztRQUNiLENBQUM7UUFDRCxRQUFRLENBQUMsTUFBVyxFQUFFLE1BQWtCLElBQUk7WUFDMUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDNUIsSUFBRyxHQUFHO2dCQUFFLEdBQUcsRUFBRSxDQUFDO1lBQ2QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBQ0QsUUFBUTtZQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMvQixDQUFDO1FBQ0QsY0FBYztZQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNyQyxDQUFDO0tBQ0Y7SUEvRUQsZ0NBK0VDIn0=