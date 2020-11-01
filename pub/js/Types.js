define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UiMode = exports.EMPTY_BOX = exports.EMPTY_STICKY_BOX = exports.Side = void 0;
    var Side;
    (function (Side) {
        Side[Side["LEFT"] = 0] = "LEFT";
        Side[Side["RIGHT"] = 1] = "RIGHT";
        Side[Side["TOP"] = 2] = "TOP";
        Side[Side["BOTTOM"] = 3] = "BOTTOM";
    })(Side = exports.Side || (exports.Side = {}));
    exports.EMPTY_STICKY_BOX = () => ({ top: null, left: null, bottom: null, right: null });
    exports.EMPTY_BOX = () => ({ top: null, left: null, bottom: null, right: null });
    /**
     * @enum = {
     * NONE
     * DRAG
     * RESIZE
     * DRAW
     * } UiMode
     */
    var UiMode;
    (function (UiMode) {
        UiMode[UiMode["NONE"] = 0] = "NONE";
        UiMode[UiMode["DRAG"] = 1] = "DRAG";
        UiMode[UiMode["RESIZE"] = 2] = "RESIZE";
        UiMode[UiMode["DRAW"] = 3] = "DRAW";
        UiMode[UiMode["HIDE"] = 4] = "HIDE";
    })(UiMode = exports.UiMode || (exports.UiMode = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHMvVHlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQW1HQSxJQUFZLElBQWlDO0lBQTdDLFdBQVksSUFBSTtRQUFHLCtCQUFJLENBQUE7UUFBRSxpQ0FBSyxDQUFBO1FBQUUsNkJBQUcsQ0FBQTtRQUFFLG1DQUFNLENBQUE7SUFBQyxDQUFDLEVBQWpDLElBQUksR0FBSixZQUFJLEtBQUosWUFBSSxRQUE2QjtJQUVoQyxRQUFBLGdCQUFnQixHQUFpQixHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7SUFDNUYsUUFBQSxTQUFTLEdBQWMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBVS9GOzs7Ozs7O09BT0c7SUFDSCxJQUFZLE1BTVg7SUFORCxXQUFZLE1BQU07UUFDaEIsbUNBQUksQ0FBQTtRQUNKLG1DQUFJLENBQUE7UUFDSix1Q0FBTSxDQUFBO1FBQ04sbUNBQUksQ0FBQTtRQUNKLG1DQUFJLENBQUE7SUFDTixDQUFDLEVBTlcsTUFBTSxHQUFOLGNBQU0sS0FBTixjQUFNLFFBTWpCIn0=