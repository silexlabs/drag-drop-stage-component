import {patchWindow} from '../../src/ts/utils/Polyfill';

describe('Polyfill', function() {

  beforeEach(function () {
    patchWindow(window);

    document.head.innerHTML = `<style>
      .isDropZone {
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
      <div class="isDropZone" id="container1">
        <div class="selectable" id="elem1"></div>
        <div class="selectable" id="elem2"></div>
        <div class="selectable" id="elem3"></div>
      </div>
      <div class="isDropZone" id="container2"></div>
    `;
  });

  it('should find 3 elementsFromPoint', function() {
    var elements = document.elementsFromPoint(10, 10);
    expect(elements.length).toBe(5);
  });

});
