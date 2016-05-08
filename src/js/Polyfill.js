exports.Polyfill = {
  patchWindow: function(win) {
    if(!win.document.elementsFromPoint) {
      console.warn('Polyfill for document.elementsFromPoint', win);
      win.document.elementsFromPoint = function(x, y) {
        return Array.from(document.body.querySelectorAll('*')).filter(function(el) {
          var pos = el.getBoundingClientRect();
          return pos.left <= x && x <= pos.right && pos.top <= y && y <= pos.bottom;
        });
      }
    }
  }
}
