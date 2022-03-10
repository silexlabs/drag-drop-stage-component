import * as types from '../Types';
import { StageStore } from '../flux/StageStore';

/**
 * get the bounding box of an element relative to the document, not the viewport (unlike el.getBoundingClientRect())
 */
export function getBoundingBoxDocument(el: HTMLElement): types.FullBox {
  const doc = getDocument(el);
  const scroll = getScroll(doc);
  const box = el.getBoundingClientRect();
  return {
    top: box.top + scroll.y,
    left: box.left + scroll.x,
    bottom: box.bottom + scroll.y,
    right: box.right + scroll.x,
    width: box.width,
    height: box.height,
  }
}

/**
 * get the bounding box of several elements
 * relative to the the document
 */
export function getBoundingBox(selectables: Array<types.SelectableState>): types.FullBox {
  const box: types.FullBox = {
    top: Infinity,
    left: Infinity,
    bottom: -Infinity,
    right: -Infinity,
    width: 0,
    height: 0,
  }
  selectables.forEach(s => {
    const rect: types.FullBox = fromClientToComputed(s.metrics);
    box.top = Math.min(box.top, rect.top);
    box.left = Math.min(box.left, rect.left);
    box.bottom = Math.max(box.bottom, rect.top + rect.height);
    box.right = Math.max(box.right, rect.left + rect.width);
  });
  return {
    ...box,
    width: box.right - box.left,
    height: box.bottom - box.top,
  };
}

export const SCROLL_ZONE_SIZE = 0;

/**
 * get the ideal scroll in order to have boundingBox visible
 * boundingBox is expected to be relative to the document, not the viewport
 */
export function getScrollToShow(doc: HTMLDocument, boundingBox: types.FullBox): types.ScrollData {
  const scroll = getScroll(doc);
  const win = getWindow(doc);
  // vertical
  if(win.innerHeight < boundingBox.height) {
    // element bigger than viewport
    if(scroll.y + win.innerHeight < boundingBox.top || scroll.y > boundingBox.bottom) {
      // not visible => scroll to top
      scroll.y = boundingBox.top - SCROLL_ZONE_SIZE;
    }
    else {
      // partly visible => do not scroll at all
    }
  }
  // if(scroll.y > boundingBox.top - SCROLL_ZONE_SIZE) {
  else if(scroll.y > boundingBox.top) {
    // element is up the viewport
    scroll.y = boundingBox.top - SCROLL_ZONE_SIZE;
  }
  // else if(scroll.y < boundingBox.bottom + SCROLL_ZONE_SIZE - win.innerHeight) {
  else if(scroll.y < boundingBox.bottom - win.innerHeight) {
    // element is lower than the viewport
    scroll.y = boundingBox.bottom + SCROLL_ZONE_SIZE - win.innerHeight;
  }

  // horizontal
  if(win.innerWidth < boundingBox.width) {
    // element bigger than viewport
    if(scroll.x + win.innerWidth < boundingBox.left || scroll.x > boundingBox.right) {
      // not visible => scroll to left 
      scroll.x = boundingBox.left - SCROLL_ZONE_SIZE;
    }
    else {
      // partly visible => do not scroll at all
    }
  }
  // if(scroll.x > boundingBox.left - SCROLL_ZONE_SIZE) {
  else if(scroll.x > boundingBox.left) {
    scroll.x = boundingBox.left - SCROLL_ZONE_SIZE;
  }
  // else if(scroll.x < boundingBox.right + SCROLL_ZONE_SIZE - win.innerWidth) {
  else if(scroll.x < boundingBox.right - win.innerWidth) {
    scroll.x = boundingBox.right + SCROLL_ZONE_SIZE - win.innerWidth;
  }
  return {
    x: Math.max(0, scroll.x),
    y: Math.max(0, scroll.y),
  };
}


/**
 * retrieve the document's window
 * @param {HTMLDocument} doc
 * @return {Window}
 */
export function getWindow(doc): Window {
  return doc['parentWindow'] || doc.defaultView;
}

/**
 * retrieve the document which holds this element
 * @param {HTMLElement} el
 * @return {HTMLDocument}
 */
export function getDocument(el): HTMLDocument {
  return el.ownerDocument;
}

/**
 * @param {HTMLElement} el
 */
export function setMetrics(el: HTMLElement, metrics: types.ElementMetrics, useMinHeight: boolean, useClientRect: boolean = false) {
  const doc = getDocument(el);
  const win = getWindow(doc);
  const style = win.getComputedStyle(el);
  const position = style.getPropertyValue('position');

  // handle position
  if(position !== metrics.position) {
    el.style.position = metrics.position;
  }

  // handle DOM metrics
  function updateStyle(objName, propName, styleName) {
    const styleValue = metrics[objName][propName];
    if((parseInt(style.getPropertyValue(objName + '-' + propName)) || 0) !== styleValue) {
      el.style[styleName] = styleValue + 'px';
    }
  }

  if(useClientRect) {
    const computedStyleRect: types.FullBox = fromClientToComputed(metrics);
    if(metrics.position !== 'static') {
      el.style.top = computedStyleRect.top + 'px';
      el.style.left = computedStyleRect.left + 'px';
    }
    el.style.width = computedStyleRect.width + 'px';
    el.style[useMinHeight ? 'minHeight' : 'height'] = computedStyleRect.height + 'px';
  }
  else {
    if(metrics.position !== 'static') {
      updateStyle('computedStyleRect', 'top', 'top');
      updateStyle('computedStyleRect', 'left', 'left');
    }
    updateStyle('computedStyleRect', 'width', 'width');
    updateStyle('computedStyleRect', 'height', useMinHeight ? 'minHeight' : 'height');
  }

  updateStyle('margin', 'top', 'marginTop');
  updateStyle('margin', 'left', 'marginLeft');
  updateStyle('margin', 'bottom', 'marginBottom');
  updateStyle('margin', 'right', 'marginRight');

  updateStyle('padding', 'top', 'paddingTop');
  updateStyle('padding', 'left', 'paddingLeft');
  updateStyle('padding', 'bottom', 'paddingBottom');
  updateStyle('padding', 'right', 'paddingRight');

  updateStyle('border', 'top', 'borderTopWidth');
  updateStyle('border', 'left', 'borderLeftWidth');
  updateStyle('border', 'bottom', 'borderBottomWidth');
  updateStyle('border', 'right', 'borderRightWidth');
}

/**
 * @param {HTMLElement} el
 * @return {ElementMetrics} the element metrics
 */
export function getMetrics(el): types.ElementMetrics {
  const doc = getDocument(el);
  const win = getWindow(doc);
  const style = win.getComputedStyle(el);
  const clientRect = getBoundingBoxDocument(el);
  return {
    position: style.getPropertyValue('position'),
    proportions: clientRect.height / (clientRect.width || .000000000001),
    computedStyleRect: {
      width: parseInt(style.getPropertyValue('width')) || 0,
      height: parseInt(style.getPropertyValue('height')) || 0,
      left: parseInt(style.getPropertyValue('left')) || 0,
      top: parseInt(style.getPropertyValue('top')) || 0,
      bottom: parseInt(style.getPropertyValue('bottom')) || 0,
      right: parseInt(style.getPropertyValue('right')) || 0,
    },
    border: {
      left: parseInt(style.getPropertyValue('border-left-width')) || 0,
      top: parseInt(style.getPropertyValue('border-top-width')) || 0,
      right: parseInt(style.getPropertyValue('border-right-width')) || 0,
      bottom: parseInt(style.getPropertyValue('border-bottom-width')) || 0,
    },
    padding: {
      left: parseInt(style.getPropertyValue('padding-left')) || 0,
      top: parseInt(style.getPropertyValue('padding-top')) || 0,
      right: parseInt(style.getPropertyValue('padding-right')) || 0,
      bottom: parseInt(style.getPropertyValue('padding-bottom')) || 0,
    },
    margin: {
      left: parseInt(style.getPropertyValue('margin-left')) || 0,
      top: parseInt(style.getPropertyValue('margin-top')) || 0,
      right: parseInt(style.getPropertyValue('margin-right')) || 0,
      bottom: parseInt(style.getPropertyValue('margin-bottom')) || 0,
    },
    clientRect: {
      top: clientRect.top,
      left: clientRect.left,
      bottom: clientRect.bottom,
      right: clientRect.right,
      width: clientRect.width,
      height: clientRect.height,
    },
  }
}


/**
 * @param {HTMLDocument} doc
 * @return {ScrollData} the scroll state for the document
 */
export function getScroll(doc) {
  const win = getWindow(doc);
  return {
    x: win.scrollX,
    y: win.scrollY,
  }
}

export function getScrollBarSize(): number {
  // Create the measurement node
  var scrollDiv = document.createElement("div") as HTMLElement;
  scrollDiv.style.width = '100px';
  scrollDiv.style.height = '100px';
  scrollDiv.style.overflow = 'scroll';
  scrollDiv.style.position = 'absolute';
  scrollDiv.style.top = '-9999px';
  document.body.appendChild(scrollDiv);

  // Get the scrollbar width
  var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;

  // Delete the DIV
  document.body.removeChild(scrollDiv);

  return scrollbarWidth;
}

/**
 * @param {HTMLDocument} doc
 * @param {ScrollData} scroll, the scroll state for the document
 */
export function setScroll(doc: HTMLDocument, scroll: types.ScrollData) {
  const win = getWindow(doc);
  win.scroll(scroll.x, scroll.y);
}

const BORDER_SIZE = 10;


export const CURSOR_DEFAULT = 'default';
export const CURSOR_SELECT = 'pointer';
export const CURSOR_MOVE = 'move';
export const CURSOR_NW = 'nw-resize';
export const CURSOR_NE = 'ne-resize';
export const CURSOR_SW = 'sw-resize';
export const CURSOR_SE = 'se-resize';
export const CURSOR_W = 'w-resize';
export const CURSOR_E = 'e-resize';
export const CURSOR_N = 'n-resize';
export const CURSOR_S = 's-resize';

// check if the mouse is on the side of the selectable
// this happens only when the mouse is over the selectable
export function getDirection(clientX, clientY, scrollData: types.ScrollData, selectable: types.SelectableState): {x: string, y: string} {
  const bb = selectable.metrics.clientRect;
  const distFromBorder = {
    left: clientX + scrollData.x - bb.left,
    right: bb.width + bb.left - (clientX + scrollData.x),
    top: clientY + scrollData.y - bb.top,
    bottom: bb.height + bb.top - (clientY + scrollData.y),
  }
  // get resize direction
  const direction = { x: '', y: '' };
  if(distFromBorder.left < BORDER_SIZE) direction.x = 'left';
  else if(distFromBorder.right < BORDER_SIZE) direction.x = 'right';
  if(distFromBorder.top < BORDER_SIZE) direction.y = 'top';
  else if(distFromBorder.bottom < BORDER_SIZE) direction.y = 'bottom';
  return direction;
}

export function getResizeCursorClass(direction) {
  if(direction.x === 'left' && direction.y === 'top') return CURSOR_NW;
  else if(direction.x === 'right' && direction.y === 'top') return CURSOR_NE;
  else if(direction.x === 'left' && direction.y === 'bottom') return CURSOR_SW;
  else if(direction.x === 'right' && direction.y === 'bottom') return CURSOR_SE;
  else if(direction.x === 'left' && direction.y === '') return CURSOR_W;
  else if(direction.x === 'right' && direction.y === '') return CURSOR_E;
  else if(direction.x === '' && direction.y === 'top') return CURSOR_N;
  else if(direction.x === '' && direction.y === 'bottom') return CURSOR_S;
  throw new Error('direction not found');
}

export function isResizeable(resizeable: types.Direction | boolean, direction: {x: string, y: string}): boolean {
  if(typeof resizeable === 'object') {
    return (direction.x !== '' || direction.y !== '') && [
      {x: 'left', y: 'top'},
      {x: 'right', y: 'top'},
      {x: 'left', y: 'bottom'},
      {x: 'right', y: 'bottom'},
    ].reduce((prev, dir): boolean => {
      const res = prev || (
        ((resizeable[dir.x] && direction.x === dir.x) || direction.x === '') &&
        ((resizeable[dir.y] && direction.y === dir.y) || direction.y === '')
      );
      return res;
    }, false);
  }
  else {
    return direction.x !== '' || direction.y !== '';
  }
}

export function getCursorData(clientX: number, clientY: number, scrollData: types.ScrollData, selectable: types.SelectableState): types.CursorData {
  if(selectable) {
    const direction = getDirection(clientX, clientY, scrollData, selectable);
    if(isResizeable(selectable.resizeable, direction)) {
      return {
        x: direction.x,
        y: direction.y,
        cursorType: getResizeCursorClass(direction),
      };
    }
    else if(selectable.draggable) {
      return {
        x: '',
        y: '',
        cursorType: CURSOR_MOVE,
      };
    }
    else if(selectable.selected) {
      return {
        x: '',
        y: '',
        cursorType: CURSOR_SELECT,
      };
    }
    else {
      return {
        x: '',
        y: '',
        cursorType: CURSOR_DEFAULT,
      };
    }
  }
  else {
    return {
      x: '',
      y: '',
      cursorType: CURSOR_DEFAULT,
    };
  }
}


/**
 * retrive the state for this element
 */
export function getSelectableState(store: StageStore, el): types.SelectableState {
  return store.getState().selectables.find(selectable => selectable.el === el);
}


/**
 * helper to get the states of the selected elements
 */
export function getSelection(store: StageStore): Array<types.SelectableState> {
  return store.getState().selectables.filter(selectable => selectable.selected);
}


/**
 * returns the state of the first container which is selectable
 * or null if the element and none of its parents are selectable
 */
export function getSelectable(store: StageStore, element: HTMLElement): types.SelectableState {
  let el = element;
  let data;
  while(!!el && !(data = getSelectableState(store, el))) {
    el = el.parentElement;
  }
  return data;
}


/**
 * check if an element has a parent which is selected and draggable
 * @param {HTMLElement} selectable
 */
export function hasASelectedDraggableParent(store: StageStore, el: HTMLElement) {
  const selectableParent = getSelectable(store, el.parentElement);
  if(selectableParent) {
    if(selectableParent.selected && selectableParent.draggable) return true;
    else return hasASelectedDraggableParent(store, selectableParent.el);
  }
  else {
    return false;
  }
}

/**
 *
 * @param {ElementMetrics} metrics
 * @return {string} get the computedStyleRect that matches metrics.clientRect
 */
export function fromClientToComputed(metrics: types.ElementMetrics): types.FullBox {
  return {
    top: Math.round(metrics.clientRect.top + metrics.margin.top),
    left: Math.round(metrics.clientRect.left + metrics.margin.left),
    right: Math.round(metrics.clientRect.right + metrics.margin.left + metrics.padding.left + metrics.padding.right + metrics.border.left + metrics.border.right - (metrics.border.left + metrics.border.right)),
    bottom: Math.round(metrics.clientRect.bottom + metrics.margin.top + metrics.padding.top + metrics.padding.bottom + metrics.border.top + metrics.border.bottom - (metrics.border.top + metrics.border.bottom)),
    width: Math.round(metrics.clientRect.width + metrics.padding.left + metrics.padding.right + metrics.border.left + metrics.border.right - 2*(metrics.border.left + metrics.border.right)),
    height: Math.round(metrics.clientRect.height + metrics.border.top + metrics.border.bottom + metrics.padding.top + metrics.padding.bottom - 2*(metrics.border.top + metrics.border.bottom)),
  };
}


/**
 * find the dropZone elements which are under the mouse
 * the first one in the list is the top most one
 * x and y are relative to the viewport, not the document
 */
export function findDropZonesUnderMouse(doc: HTMLDocument, store: StageStore, hooks: types.Hooks, x: number, y: number): Array<HTMLElement> {
  const win = getWindow(doc);

  // constrain the coord inside the viewport (otherwise elementsFromPoint will return null)
  const constrain = (num, min, max) => Math.min(Math.max(num, min), max);
  const safeX = constrain(x, 0, win.innerWidth - 1);
  const safeY = constrain(y, 0, win.innerHeight - 1);

  const selectables = store.getState().selectables;
  const selection = selectables.filter(s => s.selected);

  // get a list of all dropZone zone under the point (x, y)
  return doc.elementsFromPoint(safeX, safeY)
  .filter((el: HTMLElement) => {
    const selectable = selectables.find(s => s.el === el);
    return selectable
      && selectable.isDropZone
      && !selection.find(s => s.el === el);
  }) as Array<HTMLElement>;
}

export function findSelectableUnderMouse(doc: HTMLDocument, store: StageStore, x: number, y: number): Array<HTMLElement> {
  const win = getWindow(doc);

  // constrain the coord inside the viewport (otherwise elementsFromPoint will return null)
  const constrain = (num, min, max) => Math.min(Math.max(num, min), max);
  const safeX = constrain(x, 0, win.innerWidth - 1);
  const safeY = constrain(y, 0, win.innerHeight - 1);

  const selectables = store.getState().selectables;

  return doc.elementsFromPoint(safeX, safeY)
  .filter((el: HTMLElement) => !!selectables.find(s => s.el === el)) as Array<HTMLElement>;
}

/**
 * move an element and update its data in selection
 * when elements are in a container which is moved, the clientRect changes but not the computedStyleRect
 */
export function move(selectable: types.SelectableState, onlyClientRect: boolean, movementX: number, movementY: number): types.SelectableState {
  return {
    ...selectable,
    translation: selectable.translation ? {
      x: selectable.translation.x + movementX,
      y: selectable.translation.y + movementY,
    } : null,
    metrics: {
      ...selectable.metrics,
      clientRect : {
        ...selectable.metrics.clientRect,
        top: selectable.metrics.clientRect.top + movementY,
        left: selectable.metrics.clientRect.left + movementX,
        bottom: selectable.metrics.clientRect.bottom + movementY,
        right: selectable.metrics.clientRect.right + movementX,
      },
      computedStyleRect: onlyClientRect ? selectable.metrics.computedStyleRect : {
        ...selectable.metrics.computedStyleRect,
        top: selectable.metrics.computedStyleRect.top + movementY,
        left: selectable.metrics.computedStyleRect.left + movementX,
        bottom: selectable.metrics.computedStyleRect.bottom + movementY,
        right: selectable.metrics.computedStyleRect.right + movementX,
      },
    }
  };
}
