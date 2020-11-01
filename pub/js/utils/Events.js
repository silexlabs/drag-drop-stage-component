define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.addEvent = void 0;
    /**
     * add an event listener and returns an a method to call to remove the listener
     */
    function addEvent(obj, type, listener, options = {}) {
        obj.addEventListener(type, listener, options);
        return () => obj.removeEventListener(type, listener, options);
    }
    exports.addEvent = addEvent;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3RzL3V0aWxzL0V2ZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBQ0E7O09BRUc7SUFDSCxTQUFnQixRQUFRLENBQUMsR0FBZ0IsRUFBRSxJQUFZLEVBQUUsUUFBdUIsRUFBRSxVQUFlLEVBQUU7UUFDakcsR0FBRyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDOUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBSEQsNEJBR0MifQ==