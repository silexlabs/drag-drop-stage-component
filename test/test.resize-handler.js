require("babel-polyfill");
var Polyfill = require('../src/js/Polyfill').Polyfill;
Polyfill.patchWindow(window);

var assert = require('assert');

describe('ResizeHandler', function() {

  var ResizeHandler;
  var elem1;
  var elem2;
  var elem3;

  beforeEach(function () {
    ResizeHandler = require('../src/js/ResizeHandler').ResizeHandler;
    document.head.innerHTML = `<style>
      * {
        margin: 0;
        padding: 0;
      }
      .selectable {
        width: 10px;
        height: 10px;
        border: 1px solid red;
      }
    </style>`;

    document.body.innerHTML = `
      <div class="selectable resizeable" id="elem1"></div>
      <div class="selectable resizeable" id="elem2"></div>
      <div class="selectable resizeable" id="elem3"></div>
    `;

    elem1 = document.querySelector('#elem1');
    elem2 = document.querySelector('#elem2');
    elem3 = document.querySelector('#elem3');
  });

  it('should resize 1 element from the bottom right corner', function() {
    var handler = new ResizeHandler([elem1], document, {
      keepProportions: false,
      useMinHeightHook: el => true,
      direction: {x: 'right', y: 'bottom'},
    });

    handler.update(0, 10, 10, 20);
    assert.equal(elem1.style.width, '12px', `The element should have a width '12px' instead of '${elem1.style.width}'`)
    assert.equal(elem1.style.minHeight, '22px', `The element should have a height of '22px' instead of '${elem1.style.minHeight}'`)

    handler.release();
  });

  it('should resize 2 elements from the bottom right corner', function() {
    var handler = new ResizeHandler([elem1, elem2], document, {
      keepProportions: false,
      useMinHeightHook: el => true,
      direction: {x: 'right', y: 'bottom'},
    });

    handler.update(0, 10, 10, 20);
    assert.equal(elem1.style.width, '12px', `The element should have a width '12px' instead of '${elem1.style.width}'`)
    assert.equal(elem1.style.minHeight, '22px', `The element should have a height of '22px' instead of '${elem1.style.minHeight}'`)
    assert.equal(elem2.style.width, '12px', `The element should have a width '12px' instead of '${elem2.style.width}'`)
    assert.equal(elem2.style.minHeight, '22px', `The element should have a height of '22px' instead of '${elem2.style.minHeight}'`)

    handler.release();
  });

  it('should resize 1 element from the top left corner', function() {
    var handler = new ResizeHandler([elem1], document, {
      useMinHeightHook: el => true,
      direction: {x: 'left', y: 'top'},
    });

    handler.update(0, -10, 10, 0, false);
    assert.equal(elem1.style.width, '12px', `The element should have a width '12px' instead of '${elem1.style.width}'`)
    assert.equal(elem1.style.minHeight, '22px', `The element should have a height of '22px' instead of '${elem1.style.minHeight}'`)
    assert.equal(elem1.style.top, '-10px', `The element should have top '-10px' instead of '${elem1.style.top}'`)
    assert.equal(elem1.style.left, '0px', `The element should have left '0px' instead of '${elem1.style.left}'`)

    handler.release();
  });

  it('should resize 2 elements from the top left corner', function() {
    var handler = new ResizeHandler([elem1, elem2], document, {
      useMinHeightHook: el => true,
      direction: {x: 'left', y: 'top'},
    });

    handler.update(0, -10, 10, 0, false);
    assert.equal(elem1.style.width, '12px', `The element should have a width '12px' instead of '${elem1.style.width}'`)
    assert.equal(elem1.style.minHeight, '22px', `The element should have a height of '22px' instead of '${elem1.style.minHeight}'`)
    assert.equal(elem1.style.top, '-10px', `The element should have top '-10px' instead of '${elem1.style.top}'`)
    assert.equal(elem1.style.left, '0px', `The element should have left '0px' instead of '${elem1.style.left}'`)
    assert.equal(elem2.style.width, '12px', `The element should have a width '12px' instead of '${elem2.style.width}'`)
    assert.equal(elem2.style.minHeight, '22px', `The element should have a height of '22px' instead of '${elem2.style.minHeight}'`)

    handler.release();
  });

  it('should resize 1 element and keep proporitions', function() {
    var handler = new ResizeHandler([elem1], document, {
      useMinHeightHook: el => true,
      direction: {x: 'right', y: 'bottom'},
    });

    // move vertical => no size change
    handler.update(0, 10, 10, 20, true);
    assert.equal(elem1.style.width, '12px', `The element should have a width '12px' instead of '${elem1.style.width}'`)
    assert.equal(elem1.style.minHeight, '12px', `The element should have a height of '12px' instead of '${elem1.style.minHeight}'`)

    // move horizontal => w and h change
    handler.update(20, 0, 30, 20, true);
    assert.equal(elem1.style.width, '32px', `The element should have a width '32px' instead of '${elem1.style.width}'`)
    assert.equal(elem1.style.minHeight, '32px', `The element should have a height of '32px' instead of '${elem1.style.minHeight}'`)

    handler.release();
  });
});
