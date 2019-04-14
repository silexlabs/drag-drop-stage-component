import * as types from '../Types';
import { StageStore } from '../flux/StageStore';

export type ClientRect = {
  top: number,
  left: number,
  bottom: number,
  right: number,
  width: number,
  height: number,
}

export function getBoundingBoxDocument(el: HTMLElement): ClientRect {
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

export function getBoundingBox(selectables: Array<types.SelectableState>): ClientRect {
  const box: ClientRect = {
    top: Infinity,
    left: Infinity,
    bottom: -Infinity,
    right: -Infinity,
    width: 0,
    height: 0,
  }
  selectables.forEach(s => {
    box.top = Math.min(box.top, s.metrics.clientRect.top);
    box.left = Math.min(box.left, s.metrics.clientRect.left);
    box.bottom = Math.max(box.bottom, s.metrics.clientRect.bottom);
    box.right = Math.max(box.right, s.metrics.clientRect.right);
  });
  return {
    ...box,
    width: box.right - box.left,
    height: box.bottom - box.top,
  };
}

export const SCROLL_ZONE_SIZE = 0;

export function getScrollToShow(doc, boundingBox: ClientRect): {x: number, y: number} {
  const scroll = getScroll(doc);
  const win = getWindow(doc);
  // vertical
  if(scroll.y > boundingBox.top - SCROLL_ZONE_SIZE) {
    scroll.y = boundingBox.top - SCROLL_ZONE_SIZE;
  }
  else if(scroll.y < boundingBox.bottom + SCROLL_ZONE_SIZE - win.innerHeight) {
    scroll.y = boundingBox.bottom + SCROLL_ZONE_SIZE - win.innerHeight;
  }

  // horizontal
  if(scroll.x > boundingBox.left - SCROLL_ZONE_SIZE) {
    scroll.x = boundingBox.left - SCROLL_ZONE_SIZE;
  }
  else if(scroll.x < boundingBox.right + SCROLL_ZONE_SIZE - win.innerWidth) {
    scroll.x = boundingBox.right + SCROLL_ZONE_SIZE - win.innerWidth;
  }
  return {
    x: Math.max(0, scroll.x),
    y: Math.max(0, scroll.y),
  };
}


/**
 * @param {HTMLDocument} doc
 * @return {Window}
 */
export function getWindow(doc): Window {
  return doc['parentWindow'] || doc.defaultView;
}

/**
 * @param {HTMLElement} el
 * @return {HTMLDocument}
 */
export function getDocument(el): HTMLDocument {
  return el.ownerDocument;
}

/**
 * @param {HTMLElement} el
 */
export function setMetrics(el: HTMLElement, useMinHeight: boolean, metrics: types.ElementMetrics) {
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

  if(metrics.position !== 'static') {
    updateStyle('computedStyleRect', 'top', 'top');
    updateStyle('computedStyleRect', 'left', 'left');
  }
  updateStyle('computedStyleRect', 'width', 'width');
  updateStyle('computedStyleRect', 'height', useMinHeight ? 'minHeight' : 'height');
  // TODO: expose a hook to decide between height/bottom and width/right
  // just like minHeight and height
  // updateStyle('computedStyleRect', 'bottom', 'bottom');
  // updateStyle('computedStyleRect', 'right', 'right');

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
 * @return {{x: number, y: number}} the scroll state for the document
 */
export function getScroll(doc) {
  const win = getWindow(doc);
  return {
    x: win.scrollX,
    y: win.scrollY,
  }
}


/**
 * @param {HTMLDocument} doc
 * @param {{x: number, y: number}} scroll, the scroll state for the document
 */
export function setScroll(doc, scroll) {
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

export function getCursorData(clientX: number, clientY: number, scrollData: types.ScrollData, selectable: types.SelectableState): types.CursorData {
  if(selectable) {
    const direction = getDirection(clientX, clientY, scrollData, selectable);
    if(selectable.resizeable && (direction.x !== '' || direction.y !== '')) {
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

export function getSelectableState(store: StageStore, el) {
  return store.getState().selectables.find(selectable => selectable.el === el);
}


export function getSelection(store: StageStore) {
  return store.getState().selectables.filter(selectable => selectable.selected);
}


/**
 * returns the state of the first container which is selectable
 * or null if the element and none of its parents are selectable
 */
export function getSelectable(store: StageStore, element: HTMLElement) {
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

// /**
//  *
//  * @param {ElementMetrics} metrics
//  * @return {string} get the computedStyleRect that matches metrics.clientRect
//  */
// export function fromClientToComputed(metrics) {
//   // TODO: should we handle other scroll than the window?
//   return {
//     position: metrics.position,
//     top: Math.round(metrics.clientRect.top + metrics.margin.top),
//     left: Math.round(metrics.clientRect.left + metrics.margin.left),
//     right: Math.round(metrics.clientRect.right + metrics.margin.left + metrics.padding.left + metrics.padding.right + metrics.border.left + metrics.border.right),
//     bottom: Math.round(metrics.clientRect.bottom + metrics.margin.top + metrics.padding.top + metrics.padding.bottom + metrics.border.top + metrics.border.bottom),
//     width: Math.round(metrics.clientRect.width + metrics.padding.left + metrics.padding.right + metrics.border.left + metrics.border.right),
//     height: Math.round(metrics.clientRect.height + metrics.border.top + metrics.border.bottom + metrics.padding.top + metrics.padding.bottom),
//   };
// }
