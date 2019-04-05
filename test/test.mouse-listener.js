require("babel-polyfill");
var assert = require('assert');

import * as Polyfill from '../src/js/utils/Polyfill';
Polyfill.patchWindow(window);

import {MouseEventsListener} from '../src/js/MouseEventsListener';

describe('MouseEventsListener', function() {
  var elem1;
  var elem2;
  var cbks = {};
  var selectableElem1;

  var mouseEventsListener;
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


    cbks = {};
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
    const mouseMock = { on: (eventName, cbk) => cbks[eventName] = cbk };
    const storeMock = {
      getState: () => ({
        selectables: [selectableElem1],
        scroll: {x: 0, y: 0},
        cursorDirection: {x: '', y: ''},
      }),
      dispatch: action => window.cbkAction(action),
    }
    mouseEventsListener = new MouseEventsListener(document, mouseMock, storeMock);
  });

  it('getSelectable', function() {
    const selectable1 = mouseEventsListener.getSelectable(elem1);
    assert.notEqual(selectable1, null, `The selectable is null and should be elem1 because elem1 is selectable`);
    assert.equal(selectable1.el, elem1, `The selectable should be elem1 because elem1 is selectable`);

    const selectable2 = mouseEventsListener.getSelectable(elem2);
    assert.notEqual(selectable2, null, `The selectable is null and should be elem1 because it is in in elem1 and elem1 is selectable`);
    assert.equal(selectable2.el, elem1, `The selectable should be elem1 because elem2 is in elem1 and is not selectable`);

  });

  it('hasASelectedDraggableParent', function() {
    const result1 = mouseEventsListener.hasASelectedDraggableParent(elem1);
    assert.equal(result1, false, `The result should be false because elem1 has no selected draggable parents`);

    const result2 = mouseEventsListener.hasASelectedDraggableParent(elem2);
    assert.equal(result2, true, `The result should be true because elem2 has elem1 as its parent`);
  });

  it('onScroll', function() {
    assert.notEqual(cbks['scroll'], null, `a callback should listen for scroll event on mouse`);

    let numActions = 0;
    let lastAction;
    window.cbkAction = action => {
      numActions++;
      lastAction = action;
    }
    window.scroll(100, 100);
    assert.equal(window.scrollY, 100, `Scroll should be 100 but was ${window.scrollY}`);

    cbks['scroll']();
    assert.equal(numActions, 1, `1 action should have been fired instead of ${numActions}`);
    assert.equal(lastAction.type, 'SET', `SET action should have been fired instead of ${lastAction}`);
    assert.deepEqual(lastAction.scroll, {x:100,y:100}, `SET action with scroll 100 100 should have been fired instead of ${lastAction.scroll}`);
  });

  it('onDown', function() {
    assert.notEqual(cbks['down'], null, `a callback should listen for down event on mouse`);
    let numActions = 0;
    let lastAction;
    window.cbkAction = action => {
      numActions++;
      lastAction = action;
    }
    // elem1 with shift
    cbks['down']({target: elem1, shiftKey: true});
    assert.equal(numActions, 1, `1 action should have been fired instead of ${numActions}`);
    assert.equal(lastAction.type, 'ADD', `The action should be ADD but was ${lastAction.type}`);
    assert.equal(lastAction.selectable, selectableElem1, `The action should be ADD of elem1`);

    // elem1 with NO shift
    numActions = 0;
    cbks['down']({target: elem1, shiftKey: false});
    assert.equal(numActions, 1, `1 action should have been fired instead of ${numActions}`);
    assert.equal(lastAction.type, 'SET', `The action should be SET but was ${lastAction.type}`);
    assert.equal(lastAction.selectables[0], selectableElem1, `The action should be SET of elem1`);

    // elem2 with shift
    numActions = 0;
    cbks['down']({target: elem2, shiftKey: false});
    assert.equal(numActions, 1, `1 action should have been fired instead of ${numActions}`);
    assert.equal(lastAction.type, 'SET', `The action should be SET but was ${lastAction.type}`);
    assert.equal(lastAction.selectables[0], selectableElem1, `The action should be SET of elem1`);
  });

  it('onMove', function() {
    assert.notEqual(cbks['move'], null, `a callback should listen for move event on mouse`);
    let numActions = 0;
    let lastAction;
    window.cbkAction = action => {
      numActions++;
      lastAction = action;
    }
    // elem1 with shift
    cbks['move']({target: elem1, clientX: 100, clientY: 100});
    assert.equal(numActions, 1, `1 action should have been fired instead of ${numActions}`);
    assert.equal(lastAction.type, 'CURSOR_DIRECTION', `The action should be CURSOR_DIRECTION but was ${lastAction.type}`);
    assert.deepEqual(lastAction.cursorDirection, {x:'left', y:'top'}, `The action should be SET of elem1`);

    console.info('    > TODO: onUp, onDrag, onStartDrag, onStopDrag');
  });
});
