import * as DomMetrics from '../utils/DomMetrics';
import { SelectableState } from '../Types';

const UPDATE = 'SELECTABLE_UPDATE';
const CREATE = 'SELECTABLE_CREATE';
const DELETE = 'SELECTABLE_DELETE';

export const updateSelectables = (selectables: Array<SelectableState>) => ({
  type: UPDATE,
  selectables,
});
export const createSelectable = (selectable: SelectableState) => ({
  type: CREATE,
  selectable,
});
export const deleteSelectable = (selectable: SelectableState) => ({
  type: DELETE,
  selectable,
});

export const selectables = (state=[], action) => {
  switch(action.type) {
    case CREATE:
      return [
        ...state,
        action.selectable
      ];
    case DELETE:
      return state.filter((selectable: SelectableState) => selectable.el !== action.selectable.el);
    case UPDATE:
      return state.map((selectable: SelectableState) => action.selectables.find(s => s.el === selectable.el) || selectable);
    default:
      return state;
  }
};
