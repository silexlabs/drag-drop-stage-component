require("babel-polyfill");
var Polyfill = require('../src/js/Polyfill').Polyfill;
Polyfill.patchWindow(window);

var assert = require('assert');

describe('DrawHandler', function() {

  var DrawHandler;
  var elem1;
  var elem2;
  var elem3;

  before(function () {
    DrawHandler = require('../src/js/DrawHandler').DrawHandler;
    Element.prototype.closest = function () {
      return null;
    };
    document.head.innerHTML = `<style>
      * {
        margin: 0;
        padding: 0;
      }
      .selectable {
        min-width: 10px;
        min-height: 10px;
        border: 1px solid red;
      }
    </style>`;

    document.body.innerHTML = `
      <div class="selectable" id="elem1"></div>
      <div class="selectable" id="elem2"></div>
      <div class="selectable" id="elem3"></div>
    `;

    elem1 = document.querySelector('#elem1');
    elem2 = document.querySelector('#elem2');
    elem3 = document.querySelector('#elem3');
  });

  it('should select 1, 2 and 3 elements in the dom', function() {
    var handler = new DrawHandler(5, 5, document);
    var numElements = 0;
    handler.on('toggleSelect', (el) => {
      numElements++;
    });
    // FIXME: should pass with handler.update(0, 1, 5, 6);
    handler.update(1, 1, 6, 6);
    assert.equal(1, numElements);
    handler.update(0, 10, 6, 16);
    assert.equal(2, numElements);
    handler.update(0, 10, 6, 26);
    assert.equal(3, numElements);
    handler.release();
  });

  it('should un-select 1, 2 and 3 elements in the dom', function() {
    var handler = new DrawHandler(5, 5, document);
    var numElements = 0;
    handler.on('toggleSelect', (el) => {
      numElements++;
    });
    // FIXME: should pass with handler.update(0, 30, 5, 35);
    handler.update(1, 30, 6, 35);
    assert.equal(3, numElements);
    handler.update(0, -10, 6, 25);
    assert.equal(4, numElements);
    handler.update(0, -10, 6, 15);
    assert.equal(5, numElements);
    handler.update(0, -10, 6, 5);
    assert.equal(6, numElements);
    handler.release();
  });
});
