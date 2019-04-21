import * as types from '../Types'

export const UI_SET_MODE = 'UI_SET_MODE';
export const setMode = (mode: types.UiMode) => ({
  type: UI_SET_MODE,
  mode,
});

export const UI_SET_REFRESHING = 'UI_SET_REFRESHING';
export const setRefreshing = (refreshing: boolean) => ({
  type: UI_SET_REFRESHING,
  refreshing,
});

export const UI_SET_CATCHING_EVENTS = 'UI_SET_CATCHING_EVENTS';
export const setCatchingEvents = (catchingEvents: boolean) => ({
  type: UI_SET_CATCHING_EVENTS,
  catchingEvents,
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
    case UI_SET_REFRESHING:
      return {
        ...state,
        refreshing: action.refreshing,
      }
    case UI_SET_CATCHING_EVENTS:
      return {
        ...state,
        catchingEvents: action.catchingEvents,
      }
    default:
      return state;
  }
};

export const getDefaultState = () => {
  return {
    mode: types.UiMode.NONE,
    refreshing: false,
    catchingEvents: true,
  };
}
