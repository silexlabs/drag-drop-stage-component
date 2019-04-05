export const SCROLL_ZONE_SIZE = 50;

export function getScrollToShow(doc, boundingBox) {
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
  return scroll;
}


/**
 * @param {HTMLDocument} doc
 * @return {Window}
 */
export function getWindow(doc) {
  return doc.parentWindow || doc.defaultView;
}

/**
 * @param {HTMLElement} el
 * @return {HTMLDocument}
 */
export function getDocument(el) {
  return el.ownerDocument;
}

/**
 * @param {HTMLElement} el
 * @param {HTMLDocument} doc
 * @return {ElementMetrics} the element metrics
 */
export function getMetrics(el) {
  const doc = getDocument(el);
  const win = getWindow(doc);
  const style = win.getComputedStyle(el);
  const clientRect = el.getBoundingClientRect();
  return {
    position: style.getPropertyValue('position'),
    computedStyleRect: {
      width: style.width,
      height: style.height,
      left: style.left,
      top: style.top,
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


/**
 *
 * @param {ElementMetrics} metrics
 * @param {{x: number, y: number}} scroll
 * @return {string} get the computedStyleRect that matches metrics.clientRect
 */
export function getComputedStyleRectFromClientRect(metrics) {
  // TODO: should we handle other scroll than the window?
  return {
    position: metrics.position,
    top: Math.round(metrics.clientRect.top + metrics.margin.top),
    left: Math.round(metrics.clientRect.left + metrics.margin.left),
    right: Math.round(metrics.clientRect.right + metrics.margin.left + metrics.padding.left + metrics.padding.right + metrics.border.left + metrics.border.right),
    bottom: Math.round(metrics.clientRect.bottom + metrics.margin.top + metrics.padding.top + metrics.padding.bottom + metrics.border.top + metrics.border.bottom),
    width: Math.round(metrics.clientRect.width + metrics.padding.left + metrics.padding.right + metrics.border.left + metrics.border.right),
    height: Math.round(metrics.clientRect.height + metrics.border.top + metrics.border.bottom + metrics.padding.top + metrics.padding.bottom),
  };
}
