import { SelectableState } from '../Types';

const SET = 'SELECTION_SET';
const RESET = 'SELECTION_RESET';
const TOGGLE = 'SELECTION_TOGGLE';
const ADD = 'SELECTION_ADD';
const REMOVE = 'SELECTION_REMOVE';

export const set = (selectables: Array<SelectableState>) => ({
  type: SET,
  selectables,
})
export const reset = () => ({
  type: RESET,
})
export const toggle = (selectable: SelectableState) => ({
  type: TOGGLE,
  selectable,
})
export const add = (selectable: SelectableState) => ({
  type: ADD,
  selectable,
})
export const remove = (selectable: SelectableState) => ({
  type: REMOVE,
  selectable,
})

/**
 * reducer
 */
export const selection = (state: Array<SelectableState>=[], action) => {
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
