define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.selectables = exports.deleteSelectable = exports.createSelectable = exports.resetSelectables = exports.updateSelectables = void 0;
    const UPDATE = 'SELECTABLE_UPDATE';
    const RESET = 'SELECTABLE_RESET';
    const CREATE = 'SELECTABLE_CREATE';
    const DELETE = 'SELECTABLE_DELETE';
    exports.updateSelectables = (selectables, preventDispatch = false) => ({
        type: UPDATE,
        selectables,
        preventDispatch,
    });
    exports.resetSelectables = () => ({
        type: RESET,
    });
    exports.createSelectable = (selectable) => ({
        type: CREATE,
        selectable,
    });
    exports.deleteSelectable = (selectable) => ({
        type: DELETE,
        selectable,
    });
    exports.selectables = (state = [], action) => {
        switch (action.type) {
            case CREATE:
                return [
                    ...state,
                    action.selectable,
                ];
            case RESET:
                return [];
            case DELETE:
                return state.filter((selectable) => selectable.id !== action.selectable.id);
            case UPDATE:
                return state.map((selectable) => action.selectables.find(s => s.id === selectable.id) || selectable);
            default:
                return state;
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VsZWN0YWJsZVN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3RzL2ZsdXgvU2VsZWN0YWJsZVN0YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFFQSxNQUFNLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQztJQUNuQyxNQUFNLEtBQUssR0FBRyxrQkFBa0IsQ0FBQztJQUNqQyxNQUFNLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQztJQUNuQyxNQUFNLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQztJQUV0QixRQUFBLGlCQUFpQixHQUFHLENBQUMsV0FBbUMsRUFBRSxrQkFBMkIsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzNHLElBQUksRUFBRSxNQUFNO1FBQ1osV0FBVztRQUNYLGVBQWU7S0FDaEIsQ0FBQyxDQUFDO0lBQ1UsUUFBQSxnQkFBZ0IsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLElBQUksRUFBRSxLQUFLO0tBQ1osQ0FBQyxDQUFDO0lBQ1UsUUFBQSxnQkFBZ0IsR0FBRyxDQUFDLFVBQTJCLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDaEUsSUFBSSxFQUFFLE1BQU07UUFDWixVQUFVO0tBQ1gsQ0FBQyxDQUFDO0lBQ1UsUUFBQSxnQkFBZ0IsR0FBRyxDQUFDLFVBQTJCLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDaEUsSUFBSSxFQUFFLE1BQU07UUFDWixVQUFVO0tBQ1gsQ0FBQyxDQUFDO0lBRVUsUUFBQSxXQUFXLEdBQUcsQ0FBQyxRQUE4QixFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDdEUsUUFBTyxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQ2xCLEtBQUssTUFBTTtnQkFDVCxPQUFPO29CQUNMLEdBQUcsS0FBSztvQkFDUixNQUFNLENBQUMsVUFBVTtpQkFDbEIsQ0FBQztZQUNKLEtBQUssS0FBSztnQkFDUixPQUFPLEVBQUUsQ0FBQztZQUNaLEtBQUssTUFBTTtnQkFDVCxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUEyQixFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDL0YsS0FBSyxNQUFNO2dCQUNULE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQTJCLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxVQUFVLENBQUMsRUFBRSxDQUFDLElBQUksVUFBVSxDQUFDLENBQUM7WUFDeEg7Z0JBQ0UsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDSCxDQUFDLENBQUMifQ==