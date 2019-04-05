const CURSOR_DIRECTION = 'CURSOR_DIRECTION';
export const setCursorDirection = (cursorDirection) => ({
  type: CURSOR_DIRECTION,
  cursorDirection,
});

export const MODE_NONE = 'NONE';
export const MODE_DRAG = 'DRAG';
export const MODE_RESIZE = 'RESIZE';
export const MODE_DRAW = 'DRAW';

export const setModeNone = () => ({
  type: MODE_NONE,
  data: {},
});
export const setModeDrag = (data) => ({
  type: MODE_DRAG,
  data,
});
export const setModeResize = (data) => ({
  type: MODE_RESIZE,
  data,
});
export const setModeDraw = (data) => ({
  type: MODE_DRAW,
  data,
});

const MOUSE_HANDLER_DATA = 'MOUSE_HANDLER_DATA';
export const setMouseHandlerData = data => ({
  type: MOUSE_HANDLER_DATA,
  data,
});

/**
 * reducer
 */
export const ui = (state, action) => {
  switch(action.type) {
    case MODE_NONE:
    case MODE_DRAG:
    case MODE_RESIZE:
    case MODE_DRAW:
      if(state.mode !== action.type) {
        return {
          ...state,
          mode: action.type,
          mouseHandlerData: action.data,
        }
      };
      return state;
    case MOUSE_HANDLER_DATA:
      return {
        ...state,
        mouseHandlerData: action.data,
      }
    case CURSOR_DIRECTION:
      return {
        ...state,
        cursorDirection: action.cursorDirection,
      }
    default:
      return state;
  }
};

export const getDefaultState = (doc, hooks) => {
  return {
    mode: MODE_NONE,
    cursorDirection: {x: '', y: ''},
    mouseHandlerData: {},
  };
}
