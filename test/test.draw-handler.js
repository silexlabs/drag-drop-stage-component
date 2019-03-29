require("babel-polyfill");
var Polyfill = require('../src/js/Polyfill').Polyfill;
Polyfill.patchWindow(window);

var assert = require('assert');

describe('DrawHandler', function() {

  var DrawHandler;
  var elem1;
  var elem2;
  var elem3;

  beforeEach(function () {
    DrawHandler = require('../src/js/DrawHandler').DrawHandler;
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
    var handler = new DrawHandler(5, 5, document, el => true);
    var numCallsSelect = 0;
    var numCallsUnselect = 0;
    handler.on('select', (el) => {
      numCallsSelect++;
    });
    handler.on('unSelect', (el) => {
      numCallsUnselect++;
    });

    handler.update(1, 1, 6, 6);
    assert.equal(numCallsSelect, 1, `select should have been fired exactly 1 times and has been ${numCallsSelect}`);
    assert.equal(numCallsUnselect, 0, `unselect has been fired ${numCallsUnselect} times and it should not`);
    assert.equal(handler.elements.length, 1, `there should be exactly 1 elements selected insted of ${handler.elements.length}`)

    handler.update(0, 10, 6, 16);
    assert.equal(numCallsSelect, 2, `select should have been fired exactly 2 times and has been ${numCallsSelect}`);
    assert.equal(numCallsUnselect, 0, `unselect has been fired ${numCallsUnselect} times and it should not`);
    assert.equal(handler.elements.length, 2, `there should be exactly 2 elements selected insted of ${handler.elements.length}`)

    handler.update(0, 10, 6, 26);
    assert.equal(numCallsSelect, 3, `select should have been fired exactly 3 times and has been ${numCallsSelect}`);
    assert.equal(numCallsUnselect, 0, `unselect has been fired ${numCallsUnselect} times and it should not`);
    assert.equal(handler.elements.length, 3, `there should be exactly 3 elements selected insted of ${handler.elements.length}`)

    handler.release();
    assert.equal(false, !!handler.regionMarker.parentNode, 'The region marker should have been removed');
    assert.equal(handler.elements.length, 0, 'The selection should have been reset now');
  });

  it('should un-select 1, 2 and 3 elements in the dom', function() {
    var handler = new DrawHandler(-1, -1, document, el => true);
    var numCallsSelect = 0;
    var numCallsUnselect = 0;
    handler.on('select', (el) => {
      numCallsSelect++;
    });
    handler.on('unSelect', (el) => {
      numCallsUnselect++;
    });
    handler.update(7, 27, 6, 26);
    assert.equal(handler.elements.length, 3, `there should be exactly 3 elements selected insted of ${handler.elements.length}`)
    numCallsUnselect = 0;
    numCallsSelect = 0;

    handler.update(0, -10, 6, 16);
    assert.equal(numCallsUnselect, 1, `unselect should have been fired exactly 1 times and has been ${numCallsUnselect}`);
    assert.equal(numCallsSelect, 0, `select has been fired ${numCallsSelect} times and it should not`);
    assert.equal(handler.elements.length, 2, `there should be exactly 2 elements selected insted of ${handler.elements.length}`)

    handler.update(0, -10, 6, 6);
    assert.equal(numCallsUnselect, 2, `unselect should have been fired exactly 1 times and has been ${numCallsUnselect}`);
    assert.equal(numCallsSelect, 0, `select has been fired ${numCallsSelect} times and it should not`);
    assert.equal(handler.elements.length, 1, `there should be exactly 1 elements selected insted of ${handler.elements.length}`)

    handler.update(0, -10, 6, -4);
    assert.equal(numCallsUnselect, 3, `unselect should have been fired exactly 1 times and has been ${numCallsUnselect}`);
    assert.equal(numCallsSelect, 0, `select has been fired ${numCallsSelect} times and it should not`);
    assert.equal(handler.elements.length, 0, `there should be exactly 0 elements selected insted of ${handler.elements.length}`)

    handler.release();
  });
});
