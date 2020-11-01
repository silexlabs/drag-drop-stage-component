define(["require", "exports", "../Types"], function (require, exports, types) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getDefaultState = exports.ui = exports.setEnableSticky = exports.UI_SET_ENABLE_STICKY = exports.setSticky = exports.UI_SET_STICKY = exports.setCatchingEvents = exports.UI_SET_CATCHING_EVENTS = exports.setRefreshing = exports.UI_SET_REFRESHING = exports.setMode = exports.UI_SET_MODE = void 0;
    exports.UI_SET_MODE = 'UI_SET_MODE';
    exports.setMode = (mode) => ({
        type: exports.UI_SET_MODE,
        mode,
    });
    exports.UI_SET_REFRESHING = 'UI_SET_REFRESHING';
    exports.setRefreshing = (refreshing) => ({
        type: exports.UI_SET_REFRESHING,
        refreshing,
    });
    exports.UI_SET_CATCHING_EVENTS = 'UI_SET_CATCHING_EVENTS';
    exports.setCatchingEvents = (catchingEvents) => ({
        type: exports.UI_SET_CATCHING_EVENTS,
        catchingEvents,
    });
    exports.UI_SET_STICKY = 'UI_SET_STICKY';
    exports.setSticky = (sticky) => ({
        type: exports.UI_SET_STICKY,
        sticky,
    });
    exports.UI_SET_ENABLE_STICKY = 'UI_SET_ENABLE_STICKY';
    exports.setEnableSticky = (enableSticky) => ({
        type: exports.UI_SET_ENABLE_STICKY,
        enableSticky,
    });
    /**
     * reducer
     */
    exports.ui = (state = exports.getDefaultState(), action) => {
        switch (action.type) {
            case exports.UI_SET_MODE:
                return Object.assign(Object.assign({}, state), { mode: action.mode });
            case exports.UI_SET_REFRESHING:
                return Object.assign(Object.assign({}, state), { refreshing: action.refreshing });
            case exports.UI_SET_CATCHING_EVENTS:
                return Object.assign(Object.assign({}, state), { catchingEvents: action.catchingEvents });
            case exports.UI_SET_STICKY:
                return Object.assign(Object.assign({}, state), { sticky: action.sticky });
            case exports.UI_SET_ENABLE_STICKY:
                return Object.assign(Object.assign({}, state), { enableSticky: action.enableSticky });
            default:
                return state;
        }
    };
    exports.getDefaultState = () => {
        return {
            mode: types.UiMode.NONE,
            refreshing: false,
            catchingEvents: true,
            sticky: types.EMPTY_STICKY_BOX(),
            enableSticky: true,
        };
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVWlTdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy9mbHV4L1VpU3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUVhLFFBQUEsV0FBVyxHQUFHLGFBQWEsQ0FBQztJQUM1QixRQUFBLE9BQU8sR0FBRyxDQUFDLElBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUMsSUFBSSxFQUFFLG1CQUFXO1FBQ2pCLElBQUk7S0FDTCxDQUFDLENBQUM7SUFFVSxRQUFBLGlCQUFpQixHQUFHLG1CQUFtQixDQUFDO0lBQ3hDLFFBQUEsYUFBYSxHQUFHLENBQUMsVUFBbUIsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNyRCxJQUFJLEVBQUUseUJBQWlCO1FBQ3ZCLFVBQVU7S0FDWCxDQUFDLENBQUM7SUFFVSxRQUFBLHNCQUFzQixHQUFHLHdCQUF3QixDQUFDO0lBQ2xELFFBQUEsaUJBQWlCLEdBQUcsQ0FBQyxjQUF1QixFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELElBQUksRUFBRSw4QkFBc0I7UUFDNUIsY0FBYztLQUNmLENBQUMsQ0FBQztJQUVVLFFBQUEsYUFBYSxHQUFHLGVBQWUsQ0FBQztJQUNoQyxRQUFBLFNBQVMsR0FBRyxDQUFDLE1BQW9CLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbEQsSUFBSSxFQUFFLHFCQUFhO1FBQ25CLE1BQU07S0FDUCxDQUFDLENBQUM7SUFFVSxRQUFBLG9CQUFvQixHQUFHLHNCQUFzQixDQUFDO0lBQzlDLFFBQUEsZUFBZSxHQUFHLENBQUMsWUFBcUIsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN6RCxJQUFJLEVBQUUsNEJBQW9CO1FBQzFCLFlBQVk7S0FDYixDQUFDLENBQUM7SUFFSDs7T0FFRztJQUNVLFFBQUEsRUFBRSxHQUFHLENBQUMsS0FBSyxHQUFDLHVCQUFlLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNwRCxRQUFPLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDbEIsS0FBSyxtQkFBVztnQkFDZCx1Q0FDSyxLQUFLLEtBQ1IsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLElBQ2xCO1lBQ0gsS0FBSyx5QkFBaUI7Z0JBQ3BCLHVDQUNLLEtBQUssS0FDUixVQUFVLEVBQUUsTUFBTSxDQUFDLFVBQVUsSUFDOUI7WUFDSCxLQUFLLDhCQUFzQjtnQkFDekIsdUNBQ0ssS0FBSyxLQUNSLGNBQWMsRUFBRSxNQUFNLENBQUMsY0FBYyxJQUN0QztZQUNILEtBQUsscUJBQWE7Z0JBQ2hCLHVDQUNLLEtBQUssS0FDUixNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sSUFDdEI7WUFDSCxLQUFLLDRCQUFvQjtnQkFDdkIsdUNBQ0ssS0FBSyxLQUNSLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWSxJQUNsQztZQUNIO2dCQUNFLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0gsQ0FBQyxDQUFDO0lBRVcsUUFBQSxlQUFlLEdBQUcsR0FBRyxFQUFFO1FBQ2xDLE9BQU87WUFDTCxJQUFJLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJO1lBQ3ZCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLGNBQWMsRUFBRSxJQUFJO1lBQ3BCLE1BQU0sRUFBRSxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7WUFDaEMsWUFBWSxFQUFFLElBQUk7U0FDbkIsQ0FBQztJQUNKLENBQUMsQ0FBQSJ9