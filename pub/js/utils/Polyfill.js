define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.patchWindow = void 0;
    function patchWindow(win) {
        if (!win.document.elementsFromPoint) {
            // console.warn('Polyfill: polyfill document.elementsFromPoint', win);
            win.document.elementsFromPoint = function (x, y) {
                // FIXME: the order is important and the 1st element should be the one on top
                return Array.from(win.document.body.querySelectorAll('*')).filter(function (el) {
                    var pos = el.getBoundingClientRect();
                    return pos.left <= x && x <= pos.right && pos.top <= y && y <= pos.bottom;
                });
            };
        }
    }
    exports.patchWindow = patchWindow;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9seWZpbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdHMvdXRpbHMvUG9seWZpbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUFBLFNBQWdCLFdBQVcsQ0FBQyxHQUFXO1FBQ3JDLElBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFO1lBQ2xDLHNFQUFzRTtZQUN0RSxHQUFHLENBQUMsUUFBUSxDQUFDLGlCQUFpQixHQUFHLFVBQVMsQ0FBQyxFQUFFLENBQUM7Z0JBQzVDLDZFQUE2RTtnQkFDN0UsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVMsRUFBRTtvQkFDM0UsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLHFCQUFxQixFQUFFLENBQUM7b0JBQ3JDLE9BQU8sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUM7Z0JBQzVFLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFBO1NBQ0Y7SUFDSCxDQUFDO0lBWEQsa0NBV0MifQ==