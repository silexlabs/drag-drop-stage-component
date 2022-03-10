
export interface Hooks {
  getId?: (el: HTMLElement) => string;
  isSelectable?: (el: HTMLElement) => boolean;
  isDraggable?: (el: HTMLElement) => boolean;
  isDropZone?: (el: HTMLElement) => boolean;
  isResizeable?: (el: HTMLElement) => (Direction | boolean);
  useMinHeight?: (el: HTMLElement) => boolean;
  canDrop?: (el: HTMLElement, dropZone: HTMLElement) => boolean;
  onSelect?: (selectables: Array<SelectableState>) => void;
  onStartDrag?: (selectables: Array<SelectableState>) => void;
  onDrag?: (selectables: Array<SelectableState>, boundingBox: FullBox) => void;
  onDrop?: (selectables: Array<SelectableState>) => void;
  onStartResize?: (selectables: Array<SelectableState>) => void;
  onResize?: (selectables: Array<SelectableState>, boundingBox: FullBox) => void;
  onResizeEnd?: (selectables: Array<SelectableState>) => void;
  onStartDraw?: () => void;
  onDraw?: (selectables: Array<SelectableState>, boundingBox: FullBox) => void;
  onDrawEnd?: () => void;
  onEdit?: () => void; // this occures when the user double clicks or press enter with one or more elements selected
  onChange?: (selectables: Array<SelectableState>) => void;
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
  id: string
  el: HTMLElement
  dropZone?: DropZone // for use by the move handler only
  selected: boolean
  hovered: boolean
  selectable: boolean
  draggable: boolean
  resizeable: Direction
  isDropZone: boolean
  useMinHeight: boolean
  metrics: ElementMetrics
  preventMetrics?: boolean // while being dragged, elements are out of the flow, do not apply styles
  translation?: {x: number, y: number}
}

export interface Box<T=number> {top: T, left: T, bottom: T, right: T }
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

export enum Side { LEFT, RIGHT, TOP, BOTTOM }
export type Sticky = Box<boolean>;
export const EMPTY_STICKY_BOX: () => Sticky = () => ({top: null, left: null, bottom: null, right: null});
export const EMPTY_BOX: () => Box = () => ({top: null, left: null, bottom: null, right: null});

export interface UiState {
  mode: UiMode
  refreshing: boolean
  catchingEvents: boolean
  sticky: Sticky
  enableSticky: boolean
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
  HIDE,
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
  hovered: HTMLElement[]
}
