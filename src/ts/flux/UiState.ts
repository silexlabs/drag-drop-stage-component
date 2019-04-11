import * as types from '../Types'

export const UI_SET_MODE = 'UI_SET_MODE';
export const setMode = (mode: types.UiMode) => ({
  type: UI_SET_MODE,
  mode,
});

/**
 * reducer
 */
export const ui = (state=getDefaultState(), action) => {
  switch(action.type) {
    case UI_SET_MODE:
      return {
        ...state,
        mode: action.mode,
      }
    default:
      return state;
  }
};

export const getDefaultState = () => {
  return {
    mode: types.UiMode.NONE,
  };
}
