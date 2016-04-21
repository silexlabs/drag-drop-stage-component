var assert = require('assert');

describe('MoveHandler', function() {

  var MoveHandler;
  
  before(function () {
    MoveHandler = require('../src/js/MoveHandler').MoveHandler;
    Element.prototype.closest = function () {
      return null;
    };
  });

  it('should move an absolute element in the dom', function() {
    document.head.innerHTML = `<style>
      #container {
        width: 1000px;
        height: 1000px;
      }
      #elem1 {
        position: absolute;
      }
      #elem1, #elem2, #elem3 {
        min-width: 200px;
        min-height: 200px;
      }
    </style>`;

    document.body.innerHTML = `
      <div class="droppable" id="container">
        <div class="selectable" id="elem1">
        </div>
        <div class="selectable" id="elem2">
        </div>
        <div class="selectable" id="elem3">
        </div>
      </div>
    `;

    var elem1 = document.querySelector('#elem1');
    var elem2 = document.querySelector('#elem2');
    var elem3 = document.querySelector('#elem3');

    var handler = new MoveHandler([elem1, elem2], document);
    handler.update(10, 10, 100, 100);
    assert.equal('translate(10px, 10px)', elem2.style.transform);
  });
});