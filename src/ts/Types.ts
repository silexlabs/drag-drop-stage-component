
export interface Hooks {
  isSelectableHook?: (el: HTMLElement) => boolean;
  isDraggableHook?: (el: HTMLElement) => boolean;
  isDropZoneHook?: (el: HTMLElement) => boolean;
  isResizeableHook?: (el: HTMLElement) => boolean;
  useMinHeightHook?: (el: HTMLElement) => boolean;
  canDrop?: (el: HTMLElement, selection: Array<SelectableState>) => boolean;
  onDrag?: (selectables: Array<SelectableState>) => void;
  onDrop?: (selectables: Array<SelectableState>) => void;
  onResize?: (selectables: Array<SelectableState>) => void;
  onSelect?: (selectables: Array<SelectableState>) => void;
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
  draggable: boolean
  resizeable: boolean
  isDropZone: boolean
  useMinHeight: boolean
  dropping: boolean // this is a drop zone which is about to receive the dragged elements
  metrics: ElementMetrics
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
