define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getDefaultState = exports.mouse = exports.setMouseData = exports.setCursorData = exports.setScroll = void 0;
    const MOUSE_SCROLL = 'MOUSE_SCROLL';
    exports.setScroll = (scrollData) => ({
        type: MOUSE_SCROLL,
        scrollData,
    });
    const MOUSE_CURSOR = 'MOUSE_CURSOR';
    exports.setCursorData = (cursorData) => ({
        type: MOUSE_CURSOR,
        cursorData,
    });
    const MOUSE_DATA = 'MOUSE_DATA';
    exports.setMouseData = (mouseData) => ({
        type: MOUSE_DATA,
        mouseData,
    });
    exports.mouse = (state = exports.getDefaultState(), action) => {
        switch (action.type) {
            case MOUSE_SCROLL:
                return Object.assign(Object.assign({}, state), { scrollData: action.scrollData });
            case MOUSE_CURSOR:
                return Object.assign(Object.assign({}, state), { cursorData: action.cursorData });
            case MOUSE_DATA:
                return Object.assign(Object.assign({}, state), { mouseData: action.mouseData });
            default:
                return state;
        }
    };
    exports.getDefaultState = () => {
        return {
            scrollData: { x: 0, y: 0 },
            cursorData: { x: '', y: '', cursorType: '' },
            mouseData: {
                movementX: 0,
                movementY: 0,
                mouseX: 0,
                mouseY: 0,
                shiftKey: false,
                target: null,
                hovered: [],
            },
        };
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW91c2VTdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy9mbHV4L01vdXNlU3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUdBLE1BQU0sWUFBWSxHQUFHLGNBQWMsQ0FBQztJQUN2QixRQUFBLFNBQVMsR0FBRyxDQUFDLFVBQTRCLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUQsSUFBSSxFQUFFLFlBQVk7UUFDbEIsVUFBVTtLQUNYLENBQUMsQ0FBQztJQUVILE1BQU0sWUFBWSxHQUFHLGNBQWMsQ0FBQztJQUN2QixRQUFBLGFBQWEsR0FBRyxDQUFDLFVBQTRCLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUQsSUFBSSxFQUFFLFlBQVk7UUFDbEIsVUFBVTtLQUNYLENBQUMsQ0FBQztJQUVILE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQztJQUNuQixRQUFBLFlBQVksR0FBRyxDQUFDLFNBQTBCLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDM0QsSUFBSSxFQUFFLFVBQVU7UUFDaEIsU0FBUztLQUNWLENBQUMsQ0FBQztJQUVVLFFBQUEsS0FBSyxHQUFHLENBQUMsUUFBd0IsdUJBQWUsRUFBRSxFQUFFLE1BQVcsRUFBRSxFQUFFO1FBQzlFLFFBQU8sTUFBTSxDQUFDLElBQUksRUFBRTtZQUNsQixLQUFLLFlBQVk7Z0JBQ2YsdUNBQ0ssS0FBSyxLQUNSLFVBQVUsRUFBRSxNQUFNLENBQUMsVUFBVSxJQUM3QjtZQUNKLEtBQUssWUFBWTtnQkFDZix1Q0FDSyxLQUFLLEtBQ1IsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVLElBQzlCO1lBQ0gsS0FBSyxVQUFVO2dCQUNiLHVDQUNLLEtBQUssS0FDUixTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVMsSUFDNUI7WUFDSDtnQkFDRSxPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNILENBQUMsQ0FBQztJQUVXLFFBQUEsZUFBZSxHQUFHLEdBQXFCLEVBQUU7UUFDcEQsT0FBTztZQUNMLFVBQVUsRUFBRSxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBQztZQUN4QixVQUFVLEVBQUUsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBQztZQUMxQyxTQUFTLEVBQUU7Z0JBQ1QsU0FBUyxFQUFFLENBQUM7Z0JBQ1osU0FBUyxFQUFFLENBQUM7Z0JBQ1osTUFBTSxFQUFFLENBQUM7Z0JBQ1QsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsTUFBTSxFQUFFLElBQUk7Z0JBQ1osT0FBTyxFQUFFLEVBQUU7YUFDWjtTQUNGLENBQUM7SUFDSixDQUFDLENBQUEifQ==