require("babel-polyfill");
var assert = require('assert');

import * as Polyfill from '../src/js/utils/Polyfill';
Polyfill.patchWindow(window);

import {StoreEventsListener} from '../src/js/StoreEventsListener';

describe('StoreEventsListener', function() {
  var elem1;
  var elem2;
  var selectableElem1, selectableElem2;
  var storeEventsListener;
  var storeSubscribeCbk;
  var state1;

  beforeEach(function () {
    document.body.innerHTML = `
      <style>
        .elem {
          margin: 1000px;
        }
        #elem2 {
          min-height: 10000px;
        }
      </style>
      <div class="elem" id="elem1">
        <div class="elem" id="elem2">
        </div>
      </div>
    `;

    elem1 = document.querySelector('#elem1');
    elem2 = document.querySelector('#elem2');


    storeSubscribeCbk = null;
    selectableElem1 = {
      el: elem1,
      selected: true,
      draggable: true,
      resizeable: true,
      droppable: true,
      metrics: {
        position: 'absolute',
        margin: {top: 0, left: 0, bottom: 0, right: 0 },
        padding: {top: 0, left: 0, bottom: 0, right: 0 },
        border: {top: 0, left: 0, bottom: 0, right: 0 },
        computedStyleRect: {top: 100, left: 100, bottom: 200, right: 200, width: 100, height: 100 },
        clientRect: {top: 100, left: 100, bottom: 200, right: 200, width: 100, height: 100 },
      },
    };
    selectableElem2 = {
      el: elem2,
      selected: false,
      draggable: true,
      resizeable: true,
      droppable: true,
      metrics: {
        position: 'static',
        margin: {top: 0, left: 0, bottom: 0, right: 0 },
        padding: {top: 0, left: 0, bottom: 0, right: 0 },
        border: {top: 0, left: 0, bottom: 0, right: 0 },
        computedStyleRect: {top: 100, left: 100, bottom: 200, right: 200, width: 100, height: 100 },
        clientRect: {top: 10, left: 10, bottom: 20, right: 20, width: 10, height: 10 },
      },
    };
    state1 = {
      selectables: [selectableElem1],
      scroll: {x: 0, y: 0},
      cursorDirection: {x: '', y: ''},
      ui: {
        mode: 'MODE_NONE',
        cursorDirection: {x: '', y: ''},
        mouseHandlerData: {},
      }
    };
    const storeMock = {
      getState: () => state1,
      dispatch: action => window.storeDispatch(action),
      subscribe: cbk => storeSubscribeCbk = cbk,
    }
    storeEventsListener = new StoreEventsListener(document, storeMock);
  });

  it('onStateChanged', function() {
    storeSubscribeCbk();
    assert.equal(window.scrollY, 0, `Initial scroll should be 0`);
  });

  it('onScroll', function() {
    state1.scroll = {
      y: 100,
      x: 0,
    };
    storeSubscribeCbk();
    assert.equal(window.scrollY, 100, `Scroll should be have changed`);
  });

  it('onUi', function() {
    state1.ui = Object.assign({}, state1.ui, {
      cursorDirection: {
        x: 'left',
        y: '',
      },
    });
    storeSubscribeCbk();
    assert.equal(document.body.style.cursor, 'w-resize', `Scroll should be have changed`);

    state1.ui = Object.assign({}, state1.ui, {
      mode: 'DRAW',
    });
    storeSubscribeCbk();
    assert.notEqual(storeEventsListener.handler, null, `Handler should have been created`);
    assert.equal(storeEventsListener.handler.type, 'DrawHandler', `Handler should be a DrawHandler`);
  });

  it('onMetrics', function() {
    state1.selectables = state1.selectables.slice();
    state1.selectables[0] = Object.assign({}, selectableElem1, {
      ...selectableElem1,
      metrics: {
        position: 'relative',
        margin: {top: 0, left: 0, bottom: 0, right: 0 },
        padding: {top: 0, left: 0, bottom: 0, right: 0 },
        border: {top: 0, left: 0, bottom: 0, right: 0 },
        computedStyleRect: {top: 200, left: 200, bottom: 200, right: 200, width: 100, height: 100 },
        clientRect: {top: 200, left: 200, bottom: 200, right: 200, width: 100, height: 100 },
      }
    })
    storeSubscribeCbk();
    assert.equal(elem1.style.top, '200px', `The element should have moved`);
  });
});
