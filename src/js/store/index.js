import * as Redux from 'redux'
import { selection } from './Selection';
import * as Selectable from './Selectable';
import * as Scroll from './Scroll';
import * as Ui from './Ui';

/**
 * @typedef {{
 *   position: {string}
 *   margin: {top: number, left: number, bottom: number, right: number }
 *   padding: {top: number, left: number, bottom: number, right: number }
 *   border: {top: number, left: number, bottom: number, right: number }
 *   computedStyleRect: {top: number, left: number, bottom: number, right: number, width: number, height: number }
 *   clientRect: {top: number, left: number, bottom: number, right: number, width: number, height: number }
 * }} ElementMetrics
 */

 /**
 * @typedef {{
 *   el: HTMLElement,
 *   selected: boolean,
 *   draggable: boolean,
 *   resizeable: boolean,
 *   droppable: boolean,
 *   metrics: ElementMetrics,
 * }} Selectable
 */

 /**
  * @enum = {
  * NONE
  * DRAG
  * RESIZE
  * DRAW
  * } ModeType
  */

/**
 * @typedef {{
 *   selectables: {Array<Selectable>},
 *   scroll: {{x: number, y: number}},
 *   ui: {{
 *     mode: ModeType,
 *     cursorDirection: {{x: string, y: string}},
 *     mouseHandlerData: {movementX: number, movementY: number, clientX: number, clientY: number, shiftKey: boolean},
 *   }}
 * }} State
 */


/**
 *
 * @param {HTMLDocument} doc
 * @param {{isSelectableHook, isDraggableHook, isDroppableHook, isResizeableHook}} hooks
 * @return ReduxStore
 */
export const createStore = (doc, hooks) => {
  const selectablesDefault = Selectable.getDefaultState(doc, hooks);
  const scrollDefault = Scroll.getDefaultState(doc, hooks);
  const uiDefault = Ui.getDefaultState(doc, hooks);
  const reducer = Redux.combineReducers({
    selectables: (state=selectablesDefault, action) => Selectable.selectable(selection(state, action), action),
    ui: (state=uiDefault, action) => Ui.ui(state, action),
    scroll: (state=scrollDefault, action) => Scroll.scroll(state, action),
  });
  return Redux.createStore(reducer);
};
