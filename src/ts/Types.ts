
export interface Hooks {
  isSelectable?: (el: HTMLElement) => boolean;
  isDraggable?: (el: HTMLElement) => boolean;
  isDropZone?: (el: HTMLElement) => boolean;
  isResizeable?: (el: HTMLElement) => boolean;
  useMinHeight?: (el: HTMLElement) => boolean;
  canDrop?: (el: HTMLElement, dropZone: HTMLElement) => boolean;
  onSelect?: (selectables: Array<SelectableState>) => void;
  onDrag?: (selectables: Array<SelectableState>, boundingBox: ClientRect) => void;
  onDrop?: (selectables: Array<SelectableState>) => void;
  onResize?: (selectables: Array<SelectableState>, boundingBox: ClientRect) => void;
  onResizeEnd?: (selectables: Array<SelectableState>) => void;
  onDraw?: (selectables: Array<SelectableState>, boundingBox: ClientRect) => void;
  onDrawEnd?: (selectables: Array<SelectableState>) => void;
}

/**
 * @typedef {{
 *   selectables: {Array<SelectableState>},
 *   mouse: {MouseState},
 *   ui: {{
 *     mode: UiMode,
 *   }}
 * }} State
 */
export interface State {
  selectables: Array<SelectableState>
  mouse: MouseState
  ui: UiState
}

export interface DropZone {
  nextElementSibling?: HTMLElement
  parent: HTMLElement
  distance?: number
}

/**
 * @typedef {{
 *   el: HTMLElement,
 *   selected: boolean,
 *   draggable: boolean,
 *   resizeable: boolean,
 *   isDropZone: boolean,
 *   metrics: ElementMetrics,
 * }} SelectableState
 */
export interface SelectableState {
  el: HTMLElement
  dropZone?: DropZone // for use by the move handler only
  selected: boolean
  selectable: boolean
  draggable: boolean
  resizeable: boolean
  isDropZone: boolean
  useMinHeight: boolean
  metrics: ElementMetrics
  preventMetrics?: boolean // while being dragged, elements are out of the flow, do not apply styles
  translation?: {x: number, y: number}
}

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
export interface ElementMetrics {
  position: string
  margin: {top: number, left: number, bottom: number, right: number }
  padding: {top: number, left: number, bottom: number, right: number }
  border: {top: number, left: number, bottom: number, right: number }
  computedStyleRect: {top: number, left: number, bottom: number, right: number, width: number, height: number }
  clientRect: {top: number, left: number, bottom: number, right: number, width: number, height: number }
  proportions: number
}

export interface UiState {
  mode: UiMode
}

/**
 * @enum = {
 * NONE
 * DRAG
 * RESIZE
 * DRAW
 * } UiMode
 */
export enum UiMode {
  NONE,
  DRAG,
  RESIZE,
  DRAW,
}

export interface MouseState {
  scrollData: ScrollData
  cursorData: CursorData
  mouseData: MouseData
}

export interface ScrollData {
  x: number
  y: number
}

export interface CursorData {
  x: string
  y: string
  cursorType: string
}

export interface MouseData {
  movementX: number
  movementY: number
  mouseX: number
  mouseY: number
  shiftKey: boolean
  target: HTMLElement
}
