const SET = 'SELECTION_SET';
const RESET = 'SELECTION_RESET';
const TOGGLE = 'SELECTION_TOGGLE';
const ADD = 'SELECTION_ADD';
const REMOVE = 'SELECTION_REMOVE';

export const set = selectables => ({
  type: SET,
  selectables,
})
export const reset = () => ({
  type: RESET,
})
export const toggle = selectable => ({
  type: TOGGLE,
  selectable,
})
export const add = selectable => ({
  type: ADD,
  selectable,
})
export const remove = selectable => ({
  type: REMOVE,
  selectable,
})

/**
 * reducer
 */
export const selection = (state=[], action) => {
  switch (action.type) {
    case TOGGLE:
      return state.map(selectable => selectable === action.selectable ? {
        ...selectable,
        selected: !selectable.selected,
      } : selectable);
    case REMOVE:
      return state.map(selectable => selectable === action.selectable ? {
        ...selectable,
        selected: false,
      } : selectable);
    case RESET:
      return state.map(selectable => ({
        ...selectable,
        selected: false,
      }));
    case ADD:
      return state.map(selectable => selectable === action.selectable ? {
        ...selectable,
        selected: true,
      } : selectable);
    case SET:
      return state.map(selectable => action.selectables.includes(selectable) ? {
        ...selectable,
        selected: true,
      } : {
        ...selectable,
        selected: false,
      });
    default:
      return state;
  }
}
