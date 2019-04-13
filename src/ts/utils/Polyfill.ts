export function patchWindow(win: Window) {
  if(!win.document.elementsFromPoint) {
    // console.warn('Polyfill: polyfill document.elementsFromPoint', win);
    win.document.elementsFromPoint = function(x, y) {
      // FIXME: the order is important and the 1st element should be the one on top
      return Array.from(win.document.body.querySelectorAll('*')).filter(function(el) {
        var pos = el.getBoundingClientRect();
        return pos.left <= x && x <= pos.right && pos.top <= y && y <= pos.bottom;
      });
    }
  }
}
