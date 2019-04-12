import * as DomMetrics from '../utils/DomMetrics';
import * as types from '../Types';

const MOUSE_SCROLL = 'MOUSE_SCROLL';
export const setScroll = (scrollData: types.ScrollData) => ({
  type: MOUSE_SCROLL,
  scrollData,
});

const MOUSE_CURSOR = 'MOUSE_CURSOR';
export const setCursorData = (cursorData: types.CursorData) => ({
  type: MOUSE_CURSOR,
  cursorData,
});

const MOUSE_DATA = 'MOUSE_DATA';
export const setMouseData = (mouseData: types.MouseData) => ({
  type: MOUSE_DATA,
  mouseData,
});

export const mouse = (state: types.MouseState=getDefaultState(), action: any) => {
  switch(action.type) {
    case MOUSE_SCROLL:
      return {
        ...state,
        scrollData: action.scrollData,
      };
    case MOUSE_CURSOR:
      return {
        ...state,
        cursorData: action.cursorData,
      }
    case MOUSE_DATA:
      return {
        ...state,
        mouseData: action.mouseData,
      }
    default:
      return state;
  }
};

export const getDefaultState = (): types.MouseState => {
  return {
    scrollData: {x: 0, y: 0},
    cursorData: {x: '', y: '', cursorType: ''},
    mouseData: {
      movementX: 0,
      movementY: 0,
      mouseX: 0,
      mouseY: 0,
      shiftKey: false,
      target: null,
    },
  };
}