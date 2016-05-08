var assert = require('assert');

describe('Polyfill', function() {

  before(function () {
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
      #elem1 {
        position: absolute;
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

    var Polyfill = require('../src/js/Polyfill').Polyfill;
    Polyfill.patchWindow(window);
  });

  it('should find 3 elementsFromPoint', function() {
    var elements = document.elementsFromPoint(10, 10);
    assert.equal(3, elements.length);
  });

});
