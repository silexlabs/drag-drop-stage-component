import * as types from '../Types';

export const SCROLL_ZONE_SIZE = 50;

type Box = {
  top: number,
  left: number,
  bottom: number,
  right: number,
}

export function getBoundingBox(selectables: Array<types.SelectableState>): Box {
  const box: Box = {
    top: Infinity,
    left: Infinity,
    bottom: -Infinity,
    right: -Infinity,
  }
  selectables.forEach(s => {
    box.top = Math.min(box.top, s.metrics.clientRect.top);
    box.left = Math.min(box.left, s.metrics.clientRect.left);
    box.bottom = Math.max(box.bottom, s.metrics.clientRect.bottom);
    box.right = Math.max(box.right, s.metrics.clientRect.right);
  });
  return box;
}

export function getScrollToShow(doc, boundingBox: Box): {x: number, y: number} {
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
export function setMetrics(el, useMinHeight, metrics) {
  const doc = getDocument(el);
  const win = getWindow(doc);
  const style = win.getComputedStyle(el);
  if(style.getPropertyValue('position') !== metrics.position) {
    el.style.position = metrics.position;
  }
  function updateStyle(objName, propName, styleName) {
    const styleValue = metrics[objName][propName];
    if((parseInt(style.getPropertyValue(objName + '-' + propName)) || 0) !== styleValue) {
      el.style[styleName] = styleValue + 'px';
    }
  }

  updateStyle('computedStyleRect', 'top', 'top');
  updateStyle('computedStyleRect', 'left', 'left');
  updateStyle('computedStyleRect', 'bottom', 'bottom');
  updateStyle('computedStyleRect', 'right', 'right');
  updateStyle('computedStyleRect', 'width', 'width');
  updateStyle('computedStyleRect', 'height', useMinHeight ? 'minHeight' : 'height');

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
  const clientRect = el.getBoundingClientRect();
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
