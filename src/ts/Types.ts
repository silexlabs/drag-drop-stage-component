
export interface Hooks {
  isSelectable?: (el: HTMLElement) => boolean;
  isDraggable?: (el: HTMLElement) => boolean;
  isDropZone?: (el: HTMLElement) => boolean;
  isResizeable?: (el: HTMLElement) => (Direction | boolean);
  useMinHeight?: (el: HTMLElement) => boolean;
  canDrop?: (el: HTMLElement, dropZone: HTMLElement) => boolean;
  onSelect?: (selectables: Array<SelectableState>) => void;
  onDrag?: (selectables: Array<SelectableState>, boundingBox: ClientRect) => void;
  onDrop?: (selectables: Array<SelectableState>) => void;
  onResize?: (selectables: Array<SelectableState>, boundingBox: ClientRect) => void;
  onResizeEnd?: (selectables: Array<SelectableState>) => void;
  onDraw?: (selectables: Array<SelectableState>, boundingBox: ClientRect) => void;
  onDrawEnd?: () => void;
  onEdit?: (selectables: Array<SelectableState>) => void;
  onEditEnd?: () => void;
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

export type Direction = {
  top: boolean
  left: boolean
  bottom: boolean
  right: boolean
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
  resizeable: Direction
  isDropZone: boolean
  useMinHeight: boolean
  metrics: ElementMetrics
  preventMetrics?: boolean // while being dragged, elements are out of the flow, do not apply styles
  translation?: {x: number, y: number}
}

export interface Box {top: number, left: number, bottom: number, right: number }
export interface FullBox {top: number, left: number, bottom: number, right: number, width: number, height: number }
/**
 * @typedef {{
 *   position: {string}
 *   margin: Box
 *   padding: Box
 *   border: Box
 *   computedStyleRect: FullBox
 *   clientRect: FullBox
 * }} ElementMetrics
 */
export interface ElementMetrics {
  position: string
  margin: Box
  padding: Box
  border: Box
  computedStyleRect: FullBox
  clientRect: FullBox
  proportions: number
}

export interface UiState {
  mode: UiMode
  refreshing: boolean
  catchingEvents: boolean
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
  EDIT,
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
