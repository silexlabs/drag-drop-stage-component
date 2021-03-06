import { SelectableState } from '../Types';

const UPDATE = 'SELECTABLE_UPDATE';
const RESET = 'SELECTABLE_RESET';
const CREATE = 'SELECTABLE_CREATE';
const DELETE = 'SELECTABLE_DELETE';

export const updateSelectables = (selectables: Array<SelectableState>, preventDispatch: boolean = false) => ({
  type: UPDATE,
  selectables,
  preventDispatch,
});
export const resetSelectables = () => ({
  type: RESET,
});
export const createSelectable = (selectable: SelectableState) => ({
  type: CREATE,
  selectable,
});
export const deleteSelectable = (selectable: SelectableState) => ({
  type: DELETE,
  selectable,
});

export const selectables = (state: Array<SelectableState>=[], action) => {
  switch(action.type) {
    case CREATE:
      return [
        ...state,
        action.selectable,
      ];
    case RESET:
      return [];
    case DELETE:
      return state.filter((selectable: SelectableState) => selectable.id !== action.selectable.id);
    case UPDATE:
      return state.map((selectable: SelectableState) => action.selectables.find(s => s.id === selectable.id) || selectable);
    default:
      return state;
  }
};
