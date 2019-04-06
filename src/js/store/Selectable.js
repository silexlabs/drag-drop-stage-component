import * as DomMetrics from '../utils/DomMetrics';

const UPDATE = 'SELECTABLE_UPDATE';
const CREATE = 'SELECTABLE_CREATE';
const DELETE = 'SELECTABLE_DELETE';

export const updateSelectable = selectable => ({
  type: UPDATE,
  selectable,
});
export const createSelectable = selectable => ({
  type: CREATE,
  selectable,
});
export const deleteSelectable = selectable => ({
  type: DELETE,
  selectable,
});

export const selectable = (state, action) => {
  switch(action.type) {
    case CREATE:
      return [
        ...state,
        action.selectable
      ];
    case DELETE:
      return state.filter(selectable => selectable.el !== action.selectable.el);
    case UPDATE:
      return state.map(selectable => selectable.el === action.selectable.el ? action.selectable : selectable);
    default:
      return state;
  }
};

/**
 * @param {{
 *   isSelectableHook: {function(el: HTMLElement): boolean},
 *   isDraggableHook: {function(el: HTMLElement): boolean},
 *   isDroppableHook: {function(el: HTMLElement): boolean},
 *   isResizeableHook: {function(el: HTMLElement): boolean}
 * }}
 * @return {DomModel}
 */
export const getDefaultState = (doc, hooks) => Array
.from(doc.querySelectorAll('*'))
.filter(el => hooks.isSelectableHook(el))
.map(el => ({
  el,
  selected: false,
  draggable: hooks.isDraggableHook(el),
  resizeable: hooks.isResizeableHook(el),
  droppable: hooks.isDroppableHook(el),
  metrics: DomMetrics.getMetrics(el, doc),
}));
