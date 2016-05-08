require("babel-polyfill");
var Polyfill = require('../src/js/Polyfill').Polyfill;
Polyfill.patchWindow(window);

var assert = require('assert');

describe('MoveHandler', function() {

  var MoveHandler;
  var elem1;
  var elem2;
  var elem3;

  before(function () {
    MoveHandler = require('../src/js/MoveHandler').MoveHandler;
    Element.prototype.closest = function () {
      return null;
    };
    document.head.innerHTML = `<style>
      .droppable {
        width: 100px;
        height: 100px;
        border: 1px solid;
      }
      .selectable {
        min-width: 10px;
        min-height: 10px;
        border: 1px solid red;
      }
    </style>`;

    document.body.innerHTML = `
      <div class="droppable" id="container1">
        <div class="selectable" id="elem1"></div>
        <div class="selectable" id="elem2"></div>
        <div class="selectable" id="elem3"></div>
      </div>
      <div class="droppable" id="container2"></div>
    `;

    elem1 = document.querySelector('#elem1');
    elem2 = document.querySelector('#elem2');
    elem3 = document.querySelector('#elem3');
  });

  it('should move an absolute element in the dom', function() {
    elem1.style.position = 'absolute';
    var handler = new MoveHandler([elem1], document);
    handler.update(10, 10, 50, 150);
    assert.equal('translate(10px, 10px)', elem1.style.transform);
    assert.equal('container2', handler.elementsData[0].destination.parent.id);
    handler.release();
    elem1.style.position = '';
  });

  it('should move an element in the flow', function() {
    var handler = new MoveHandler([elem1], document);
    handler.update(10, 10, 50, 150);
    assert.equal('translate(10px, 10px)', elem1.style.transform);
    assert.equal('container2', handler.elementsData[0].destination.parent.id);
    handler.release();
  });

  it('should move a positioned element and one in the flow', function() {
    elem1.style.position = 'absolute';
    var handler = new MoveHandler([elem1, elem2], document);
    handler.update(10, 10, 50, 150);
    assert.equal('translate(10px, 10px)', elem1.style.transform);
    assert.equal('translate(10px, 10px)', elem2.style.transform);
    assert.equal(undefined, elem3.style.transform);
    assert.equal('container2', handler.elementsData[0].destination.parent.id);
    assert.equal('container2', handler.elementsData[1].destination.parent.id);
    handler.release();
    elem1.style.position = '';
  });

  it('should find 1 dropzone at (10, 10) while dragging elem1', function() {
    var handler = new MoveHandler([elem1], document);
    var dropzones = handler.findDroppablesUnderMouse(10, 10);
    assert.equal(1, dropzones.length);
    assert.equal(true, dropzones instanceof Array);
    assert.equal(false, dropzones.indexOf(elem1) >= 0);
  });
});
