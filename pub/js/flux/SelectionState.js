define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.selection = exports.remove = exports.add = exports.toggle = exports.reset = exports.set = void 0;
    const SET = 'SELECTION_SET';
    const RESET = 'SELECTION_RESET';
    const TOGGLE = 'SELECTION_TOGGLE';
    const ADD = 'SELECTION_ADD';
    const REMOVE = 'SELECTION_REMOVE';
    exports.set = (selectables) => ({
        type: SET,
        selectables,
    });
    exports.reset = () => ({
        type: RESET,
    });
    exports.toggle = (selectable) => ({
        type: TOGGLE,
        selectable,
    });
    exports.add = (selectable) => ({
        type: ADD,
        selectable,
    });
    exports.remove = (selectable) => ({
        type: REMOVE,
        selectable,
    });
    /**
     * reducer
     */
    exports.selection = (state = [], action) => {
        switch (action.type) {
            case TOGGLE:
                return state.map(selectable => selectable === action.selectable ? Object.assign(Object.assign({}, selectable), { selected: !selectable.selected }) : selectable);
            case REMOVE:
                return state.map(selectable => selectable === action.selectable ? Object.assign(Object.assign({}, selectable), { selected: false }) : selectable);
            case RESET:
                return state.map(selectable => (Object.assign(Object.assign({}, selectable), { selected: false })));
            case ADD:
                return state.map(selectable => selectable === action.selectable ? Object.assign(Object.assign({}, selectable), { selected: true }) : selectable);
            case SET:
                return state.map(selectable => action.selectables.includes(selectable) ? Object.assign(Object.assign({}, selectable), { selected: true }) : Object.assign(Object.assign({}, selectable), { selected: false }));
            default:
                return state;
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VsZWN0aW9uU3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdHMvZmx1eC9TZWxlY3Rpb25TdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBRUEsTUFBTSxHQUFHLEdBQUcsZUFBZSxDQUFDO0lBQzVCLE1BQU0sS0FBSyxHQUFHLGlCQUFpQixDQUFDO0lBQ2hDLE1BQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFDO0lBQ2xDLE1BQU0sR0FBRyxHQUFHLGVBQWUsQ0FBQztJQUM1QixNQUFNLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQztJQUVyQixRQUFBLEdBQUcsR0FBRyxDQUFDLFdBQW1DLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDM0QsSUFBSSxFQUFFLEdBQUc7UUFDVCxXQUFXO0tBQ1osQ0FBQyxDQUFBO0lBQ1csUUFBQSxLQUFLLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUMxQixJQUFJLEVBQUUsS0FBSztLQUNaLENBQUMsQ0FBQTtJQUNXLFFBQUEsTUFBTSxHQUFHLENBQUMsVUFBMkIsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN0RCxJQUFJLEVBQUUsTUFBTTtRQUNaLFVBQVU7S0FDWCxDQUFDLENBQUE7SUFDVyxRQUFBLEdBQUcsR0FBRyxDQUFDLFVBQTJCLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbkQsSUFBSSxFQUFFLEdBQUc7UUFDVCxVQUFVO0tBQ1gsQ0FBQyxDQUFBO0lBQ1csUUFBQSxNQUFNLEdBQUcsQ0FBQyxVQUEyQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELElBQUksRUFBRSxNQUFNO1FBQ1osVUFBVTtLQUNYLENBQUMsQ0FBQTtJQUVGOztPQUVHO0lBQ1UsUUFBQSxTQUFTLEdBQUcsQ0FBQyxRQUE4QixFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDcEUsUUFBUSxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQ25CLEtBQUssTUFBTTtnQkFDVCxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEtBQUssTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLGlDQUM1RCxVQUFVLEtBQ2IsUUFBUSxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsSUFDOUIsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2xCLEtBQUssTUFBTTtnQkFDVCxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEtBQUssTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLGlDQUM1RCxVQUFVLEtBQ2IsUUFBUSxFQUFFLEtBQUssSUFDZixDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEIsS0FBSyxLQUFLO2dCQUNSLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLGlDQUMxQixVQUFVLEtBQ2IsUUFBUSxFQUFFLEtBQUssSUFDZixDQUFDLENBQUM7WUFDTixLQUFLLEdBQUc7Z0JBQ04sT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsVUFBVSxLQUFLLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxpQ0FDNUQsVUFBVSxLQUNiLFFBQVEsRUFBRSxJQUFJLElBQ2QsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2xCLEtBQUssR0FBRztnQkFDTixPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLGlDQUNuRSxVQUFVLEtBQ2IsUUFBUSxFQUFFLElBQUksSUFDZCxDQUFDLGlDQUNFLFVBQVUsS0FDYixRQUFRLEVBQUUsS0FBSyxHQUNoQixDQUFDLENBQUM7WUFDTDtnQkFDRSxPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNILENBQUMsQ0FBQSJ9