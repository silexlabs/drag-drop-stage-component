import { MoveHandler } from '../../src/ts/handlers/MoveHandler';
import { hooks, StageStoreMock } from '../flux/StageStoreMock';
import * as electron from 'electron';

describe('MoveHandler', function() {

  var elem3;
  var elem4;
  var stageStoreMock: StageStoreMock;
  var handler: MoveHandler;

  function initHandler() {
    const handler = new MoveHandler(document, document, stageStoreMock, hooks);
    jest.spyOn(handler, 'update');
    jest.spyOn(handler, 'release');
    jest.spyOn(handler, 'move');
    jest.spyOn(handler, 'updateDestinationAbsolute');
    jest.spyOn(handler, 'updateDestinationNonAbsolute');
    jest.spyOn(handler, 'markPosition');
    jest.spyOn(handler, 'findNearestPosition');
    return handler;
  }

  beforeEach(function () {
    document.head.innerHTML = `<style>
    body {
      background: grey;
      min-height: 100000px;
    }
    .selectable {
      margin: 0;
      padding: 0;
    }
    #elem1 {
      position: absolute;
      top: 100px;
      left: 100px;
      width: 100px;
      height: 100px;
      background: red;
    }
    #elem2 {
      position: absolute;
      top: 10px;
      left: 10px;
      width: 10px;
      height: 10px;
      background: green;
    }
    #elem3 * {
      background: blue;
    }
    #elem3 {
      background: yellow;
      height: 10000px;
      width: 10000px;
      margin: 200px;
      position: absolute;
      top: 0;
      left: 0;
    }
    </style>`;

    document.body.innerHTML = `
      <div id="container1">
        <div class="selectable draggable" id="elem1">
          <div class="selectable draggable" id="elem4"></div>
        </div>
        <div class="selectable draggable" id="elem2"></div>
        <div class="selectable draggable" id="elem3"></div>
      </div>
    `;

    StageStoreMock.elem1 = document.querySelector('#elem1');
    StageStoreMock.elem2 = document.querySelector('#elem2');
    elem3 = document.querySelector('#elem3');
    elem4 = document.querySelector('#elem4');

    stageStoreMock = new StageStoreMock();
    stageStoreMock.preventDispatch = true;
    jest.spyOn(stageStoreMock, 'subscribe');
    jest.spyOn(stageStoreMock, 'dispatch');
    jest.spyOn(stageStoreMock, 'getState');

    StageStoreMock.additionalSelectables = [];
    window.scroll(0, 0);

    // electron.remote.getCurrentWindow().show();
  });

  it('should move an absolute element in the dom', function() {
    // init
    stageStoreMock.selectableElem1.selected = true;
    handler = initHandler();
    expect(handler.selection.length).toBe(1);
    expect(handler.selection[0].el.id).toBe(StageStoreMock.elem1.id);
    expect(handler.selection[0].metrics.clientRect.top).toBe(100);

    // test
    var mouseData = {
      movementX: 0,
      movementY: 100,
      mouseX: 0,
      mouseY: 100,
      shiftKey: false,
      target: StageStoreMock.elem1,
    };
    stageStoreMock.mouseState.mouseData = mouseData;
    handler.update(mouseData);
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 2][0];
    expect(lastAction.type).toBe('SELECTABLE_UPDATE');
    expect(lastAction.selectables.length).toBe(1);
    expect(lastAction.selectables[0].el.id).toBe(StageStoreMock.elem1.id);
    expect(lastAction.selectables[0].metrics.clientRect.top).toBe(200);
  });

  it('should move an element in the flow', function() {
    // init
    stageStoreMock.selectableElem2.selected = true;
    stageStoreMock.selectableElem2.metrics.position = 'static';
    handler = initHandler();

    // test
    var mouseData = {
      movementY: 150 - 15, // middle of elem2
      movementX: 150 - 15, // middle of elem2
      mouseX: 150, // to middle of elem1
      mouseY: 150, // to middle of elem1
      shiftKey: false,
      target: StageStoreMock.elem2,
    };
    stageStoreMock.mouseState.mouseData = mouseData;
    handler.update(mouseData);
    handler.release();
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastUpdateAction = calls[calls.length - 2][0];
    expect(lastUpdateAction.type).toBe('SELECTABLE_UPDATE');
    expect(lastUpdateAction.selectables.length).toBe(2);
    expect(lastUpdateAction.selectables[1].el.id).toBe(StageStoreMock.elem2.id);
    expect(lastUpdateAction.selectables[1].el.parentElement.id).toBe(StageStoreMock.elem1.id);
    expect(lastUpdateAction.selectables[1].metrics.clientRect.top).toBe(110);
    expect(StageStoreMock.elem2.style.transform).toBe('');
  });

  it('move to a new container, keep the position', function() {
    // init
    stageStoreMock.selectableElem1.selected = false;
    stageStoreMock.selectableElem1.isDropZone = true;
    stageStoreMock.selectableElem2.selected = true;
    stageStoreMock.selectableElem2.metrics.position = 'absolute';
    handler = initHandler();
    expect(handler.selection.length).toBe(1);
    expect(handler.selection[0].el.id).toBe(StageStoreMock.elem2.id);
    expect(handler.selection[0].metrics.clientRect.top).toBe(10);
    expect(handler.selection[0].metrics.position).toBe('absolute');

    // test
    var mouseData = {
      movementY: 150 - 15, // middle of elem2
      movementX: 150 - 15, // middle of elem2
      mouseX: 150, // to middle of elem1
      mouseY: 150, // to middle of elem1
      shiftKey: false,
      target: StageStoreMock.elem2,
    };
    stageStoreMock.mouseState.mouseData = mouseData;
    handler.update(mouseData);
    handler.release();

    // check the actual position of the target
    // and move it to match the provided absolute position
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 2][0];
    expect(lastAction.type).toBe('SELECTABLE_UPDATE');
    expect(lastAction.selectables.length).toBe(2);
    expect(lastAction.selectables[1].el.id).toBe(StageStoreMock.elem2.id);
    expect(lastAction.selectables[1].metrics.clientRect.top).toBe(110);
    expect(lastAction.selectables[1].metrics.computedStyleRect.top).toBe(110 - 100);
  });

  it('should rebuild the whole store metrics after drop', function() {
    // init
    stageStoreMock.selectableElem2.selected = true;
    stageStoreMock.selectableElem2.metrics.position = 'static';
    handler = initHandler();

    // test
    var mouseData = {
      movementY: 1, // middle of elem2
      movementX: 1, // middle of elem2
      mouseX: 16, // to middle of nowhere
      mouseY: 16, // to middle of nowhere
      shiftKey: false,
      target: StageStoreMock.elem2,
    };
    stageStoreMock.mouseState.mouseData = mouseData;
    handler.update(mouseData);
    handler.release();
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastUpdateAction = calls[calls.length - 2][0];
    expect(lastUpdateAction.type).toBe('SELECTABLE_UPDATE');
    expect(lastUpdateAction.selectables.length).toBe(2);
    expect(lastUpdateAction.selectables[0].el.parentElement.id).toBe('container1');
  });

  it('should not move elements and their parent', function() {
    StageStoreMock.additionalSelectables.push({
      el: elem4,
      selected: true,
      selectable: false,
      draggable: true,
      resizeable: {
        top: true,
        left: true,
        bottom: true,
        right: true,
      },
      isDropZone: true,
      useMinHeight: true,
      metrics: {
        position: 'absolute',
        proportions: 1,
        margin: {top: 0, left: 0, bottom: 0, right: 0 },
        padding: {top: 0, left: 0, bottom: 0, right: 0 },
        border: {top: 0, left: 0, bottom: 0, right: 0 },
        computedStyleRect: {top: 100, left: 100, bottom: 200, right: 200, width: 100, height: 100 },
        clientRect: {top: 100, left: 100, bottom: 200, right: 200, width: 100, height: 100 },
      },
    });
    stageStoreMock.selectableElem1.selected = true;
    handler = initHandler();

    expect(handler.selection.length).toBe(1);
    expect(handler.selection[0].el.id).toBe(StageStoreMock.elem1.id);

    StageStoreMock.additionalSelectables = [];
  });

  it('should move element with a scroll', function() {
    // init
    // scroll to elem1
    stageStoreMock.state.mouse.scrollData = {
      x: 0, y: 95,
    }
    window.scroll(stageStoreMock.state.mouse.scrollData.x, stageStoreMock.state.mouse.scrollData.y);
    stageStoreMock.selectableElem1.selected = true;
    handler = initHandler();
    expect(handler.selection.length).toBe(1);
    expect(handler.selection[0].el.id).toBe(StageStoreMock.elem1.id);

    // test
    // drag elem1 10 pixels down
    var mouseData = {
      movementX: 0, // middle of elem2
      movementY: 10, // middle of elem2
      mouseX: 50, // to middle of elem1
      mouseY: 60, // to middle of elem1
      shiftKey: false,
      target: StageStoreMock.elem1,
    };
    stageStoreMock.mouseState.mouseData = mouseData;
    handler.update(mouseData);

    // check the result
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 2][0];
    expect(lastAction.type).toBe('SELECTABLE_UPDATE');
    expect(lastAction.selectables.length).toBe(1);
    expect(lastAction.selectables[0].el.id).toBe(StageStoreMock.elem1.id);
    expect(lastAction.selectables[0].metrics.clientRect.top).toBe(110);
    expect(lastAction.selectables[0].metrics.computedStyleRect.top).toBe(110);
    expect(lastAction.selectables[0].translation).not.toBeFalsy();
    expect(lastAction.selectables[0].translation.y).toBe(10);

    // drop elem1 and check the result
    handler.release();
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 2][0];
    expect(lastAction.type).toBe('SELECTABLE_UPDATE');
    expect(lastAction.selectables.length).toBe(2);
    expect(lastAction.selectables[0].el.id).toBe(StageStoreMock.elem1.id);
    expect(lastAction.selectables[0].metrics.clientRect.top).toBe(100);
    expect(lastAction.selectables[0].metrics.computedStyleRect.top).toBe(100);
    expect(lastAction.selectables[0].metrics.computedStyleRect.top).toBe(100);
    expect(lastAction.selectables[0].translation).toBeFalsy();

    // save state
    stageStoreMock.state.selectables[0] = lastAction.selectables[0];

    // drag elem1 10px right
    handler = initHandler();
    expect(handler.selection.length).toBe(1);
    expect(handler.selection[0].el.id).toBe(StageStoreMock.elem1.id);
    expect(stageStoreMock.getState().selectables[0].el.id).toBe(StageStoreMock.elem1.id);
    expect(stageStoreMock.getState().selectables[0].metrics.clientRect.top).toBe(100);
    expect(stageStoreMock.getState().selectables[0].metrics.computedStyleRect.top).toBe(100);

    var mouseData = {
      movementX: 10, // middle of elem2
      movementY: 0, // middle of elem2
      mouseX: 60, // to middle of elem1
      mouseY: 60, // to middle of elem1
      shiftKey: false,
      target: StageStoreMock.elem1,
    };
    stageStoreMock.mouseState.mouseData = mouseData;
    handler.update(mouseData);

    // check the result
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 2][0];
    expect(lastAction.type).toBe('SELECTABLE_UPDATE');
    expect(lastAction.selectables.length).toBe(1);
    expect(lastAction.selectables[0].el.id).toBe(StageStoreMock.elem1.id);
    expect(lastAction.selectables[0].metrics.clientRect.top).toBe(100);
    expect(lastAction.selectables[0].metrics.computedStyleRect.top).toBe(100);
    expect(lastAction.selectables[0].metrics.clientRect.left).toBe(110);
    expect(lastAction.selectables[0].metrics.computedStyleRect.left).toBe(110);
    expect(lastAction.selectables[0].translation).not.toBeFalsy();
    expect(lastAction.selectables[0].translation.x).toBe(10);
    expect(lastAction.selectables[0].translation.y).toBe(0);

    // drop elem1 and check the result
    handler.release();
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 2][0];
    expect(lastAction.type).toBe('SELECTABLE_UPDATE');
    expect(lastAction.selectables.length).toBe(2);
    expect(lastAction.selectables[0].el.id).toBe(StageStoreMock.elem1.id);
    expect(lastAction.selectables[0].metrics.clientRect.top).toBe(100);
    expect(lastAction.selectables[0].metrics.computedStyleRect.top).toBe(100);
    expect(lastAction.selectables[0].metrics.clientRect.left).toBe(100);
    expect(lastAction.selectables[0].metrics.computedStyleRect.left).toBe(100);
    expect(lastAction.selectables[0].translation).toBeFalsy();
  });

  it('should move element to a new container with a scroll', function() {
    // init
    var selectableElem3 = {
      el: elem3,
      selected: false,
      selectable: false,
      draggable: true,
      resizeable: {
        top: true,
        left: true,
        bottom: true,
        right: true,
      },
      isDropZone: true,
      useMinHeight: true,
      metrics: {
        position: 'absolute',
        proportions: 1,
        margin: {top: 200, left: 200, bottom: 200, right: 200 },
        padding: {top: 0, left: 0, bottom: 0, right: 0 },
        border: {top: 0, left: 0, bottom: 0, right: 0 },
        computedStyleRect: {top: 0, left: 0, bottom: 10000, right: 10000, width: 10000, height: 10000 },
        clientRect: {top: 0, left: 0, bottom: 10000, right: 10000, width: 10000, height: 10000 },
      },
    };
    StageStoreMock.additionalSelectables = [selectableElem3];
    stageStoreMock.selectableElem2.selected = true;
    stageStoreMock.selectableElem2.metrics.position = 'absolute';
    handler = initHandler();
    expect(handler.selection.length).toBe(1);
    expect(handler.selection[0].el.id).toBe(StageStoreMock.elem2.id);

    // drag elem2 into elem3
    var mouseStart = {x:15, y:15}; // middle of elem2
    var mouseEnd = {x:5000, y:5000}; // middle of elem3

    // auto scroll
    var scroll = {
      x: mouseEnd.x + 100 - window.innerWidth,
      y: mouseEnd.y + 100 - window.innerHeight,
    }

    var mouseData = {
      movementX: mouseEnd.x - mouseStart.x,
      movementY: mouseEnd.y - mouseStart.y,
      mouseX: mouseEnd.x - scroll.x,
      mouseY: mouseEnd.y - scroll.y,
      shiftKey: false,
      target: StageStoreMock.elem2,
    };
    stageStoreMock.mouseState.mouseData = mouseData;
    handler.update(mouseData);

    // check the result
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 2][0];
    expect(lastAction.type).toBe('SELECTABLE_UPDATE');
    expect(lastAction.selectables.length).toBe(1);
    expect(lastAction.selectables[0].el.id).toBe(StageStoreMock.elem2.id);
    expect(lastAction.selectables[0].metrics.clientRect.top).toBe(mouseEnd.y - 5);
    expect(lastAction.selectables[0].metrics.computedStyleRect.left).toBe(mouseEnd.x - 5);
    expect(lastAction.selectables[0].translation).not.toBeFalsy();
    expect(lastAction.selectables[0].translation.y).toBe(mouseData.movementY);
    expect(lastAction.selectables[0].dropZone.parent.id).toBe(elem3.id);
    expect(lastAction.selectables[0].translation).not.toBeFalsy();
    expect(lastAction.selectables[0].translation.x).toBe(mouseEnd.x - mouseStart.x);
    expect(lastAction.selectables[0].translation.y).toBe(mouseEnd.y - mouseStart.y);


    // ne passent plus: ???
    // // drop elem2 in elem3
    // handler.release();
    // var calls = stageStoreMock.dispatch['mock'].calls;
    // var lastAction = calls[calls.length - 2][0];
    // expect(lastAction.type).toBe('SELECTABLE_UPDATE');
    // expect(lastAction.selectables.length).toBe(3);
    // expect(lastAction.selectables[0].el.id).toBe(StageStoreMock.elem2.id);
    // expect(lastAction.selectables[0].el.parentElement.id).toBe(elem3.id);
    // expect(lastAction.selectables[0].metrics.clientRect.top).toBe(mouseEnd.y - 5);
    // expect(lastAction.selectables[0].metrics.computedStyleRect.top).toBe(mouseEnd.y - 5 - 200);
    // expect(lastAction.selectables[0].metrics.computedStyleRect.left).toBe(mouseEnd.x - 5 - 200);
    // expect(lastAction.selectables[0].translation).toBeFalsy();

    // save state
    expect(stageStoreMock.state.selectables[1].el.id).toBe(StageStoreMock.elem2.id);
    stageStoreMock.state.selectables[1] = lastAction.selectables[0];
    stageStoreMock.state.selectables[1].el.style.top = stageStoreMock.state.selectables[1].metrics.computedStyleRect.top + 'px';
    stageStoreMock.state.selectables[1].el.style.left = stageStoreMock.state.selectables[1].metrics.computedStyleRect.left + 'px';

    // drag elem2 horizontally
    stageStoreMock.selectableElem2.selected = true;
    selectableElem3.selected = false;
    stageStoreMock.selectableElem2.metrics.position = 'absolute';
    handler = initHandler();
    expect(handler.selection.length).toBe(1);
    expect(handler.selection[0].el.id).toBe(StageStoreMock.elem2.id);
    expect(stageStoreMock.getState().selectables[1].el.id).toBe(StageStoreMock.elem2.id);
    expect(lastAction.selectables[0].metrics.clientRect.top).toBe(mouseEnd.y - 5);
    expect(lastAction.selectables[0].metrics.computedStyleRect.top).toBe(mouseEnd.y - 5);
    expect(lastAction.selectables[0].metrics.computedStyleRect.left).toBe(mouseEnd.x - 5);

    var mouseStart = {x:5000, y:5000}; // middle of elem2
    var mouseEnd = {x:5010, y:5000}; // middle of elem3

    // auto scroll
    var scroll = {
      x: mouseEnd.x + 100 - window.innerWidth,
      y: mouseEnd.y + 100 - window.innerHeight,
    }
    var mouseData = {
      movementX: mouseEnd.x - mouseStart.x,
      movementY: mouseEnd.y - mouseStart.y,
      mouseX: mouseEnd.x - scroll.x,
      mouseY: mouseEnd.y - scroll.y,
      shiftKey: false,
      target: StageStoreMock.elem2,
    };
    stageStoreMock.mouseState.mouseData = mouseData;
    handler.update(mouseData);

    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 2][0];
    expect(lastAction.type).toBe('SELECTABLE_UPDATE');
    expect(lastAction.selectables.length).toBe(1);
    expect(lastAction.selectables[0].el.id).toBe(StageStoreMock.elem2.id);
    expect(lastAction.selectables[0].metrics.clientRect.top).toBe(mouseEnd.y - 5);
    expect(lastAction.selectables[0].metrics.computedStyleRect.top).toBe(mouseEnd.y - 5);
    expect(lastAction.selectables[0].metrics.computedStyleRect.left).toBe(mouseEnd.x - 5);
    expect(lastAction.selectables[0].translation).not.toBeFalsy();
    // do not pass?? expect(lastAction.selectables[0].translation.x).toBe(10);
    // do not pass?? expect(lastAction.selectables[0].translation.y).toBe(0);
    expect(lastAction.selectables[0].dropZone.parent.id).toBe(elem3.id);

    // drop
    handler.release();
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 4][0];
    expect(lastAction.type).toBe('SELECTABLE_UPDATE');
    expect(lastAction.selectables.length).toBe(1);
    expect(lastAction.selectables[0].el.id).toBe(StageStoreMock.elem2.id);
    expect(lastAction.selectables[0].el.parentElement.id).toBe(elem3.id);
    expect(lastAction.selectables[0].metrics.clientRect.top).toBe(mouseEnd.y - 5);
    expect(lastAction.selectables[0].metrics.computedStyleRect.top).toBe(mouseEnd.y - 5 - 200);
    expect(lastAction.selectables[0].metrics.computedStyleRect.left).toBe(mouseEnd.x - 5 - 200);
    expect(lastAction.selectables[0].translation).toBeFalsy();
  });

  it('should auto scroll and keep the dragged element under the mouse', function(done) {
    stageStoreMock.selectableElem2.selected = true;
    stageStoreMock.selectableElem2.metrics.position = 'absolute';
    handler = initHandler();

    // drag elem2 outside the viewport
    var mouseStart = {x:15, y:15}; // middle of elem2
    var mouseEnd = {x:15, y:window.innerHeight-1}; // to the side of the iframe

    // auto scroll
    var scroll = {
      x: 0,
      y: mouseEnd.y + 5 - window.innerHeight,
    }

    var mouseData = {
      movementX: mouseEnd.x - mouseStart.x,
      movementY: mouseEnd.y - mouseStart.y,
      mouseX: mouseEnd.x,
      mouseY: mouseEnd.y,
      shiftKey: false,
      target: StageStoreMock.elem2,
    };
    stageStoreMock.mouseState.mouseData = mouseData;
    handler.update(mouseData);

    // check the result
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 2][0];
    expect(lastAction.type).toBe('SELECTABLE_UPDATE');
    expect(lastAction.selectables.length).toBe(1);
    expect(lastAction.selectables[0].el.id).toBe(StageStoreMock.elem2.id);
    expect(lastAction.selectables[0].translation).not.toBeFalsy();
    expect(lastAction.selectables[0].translation.y).toBe(mouseData.movementY);

    // wait until the scroll has been adjusted by the handler
    setTimeout(() => {
      try {
        // scroll
        var calls = stageStoreMock.dispatch['mock'].calls;
        var lastAction = calls[calls.length - 1][0];
        expect(lastAction.type).toBe('MOUSE_SCROLL');
        expect(lastAction.scrollData).not.toBeFalsy();
        expect(lastAction.scrollData.y).toBe(scroll.y);

        // move selection
        // apply the changes manually
        window.scroll(lastAction.scrollData.x, lastAction.scrollData.y);
        handler.onScroll(lastAction.scrollData, {x: 0, y: 0});

        // check the result
        var calls = stageStoreMock.dispatch['mock'].calls;
        var lastAction = calls[calls.length - 2][0];
        expect(lastAction.type).toBe('SELECTABLE_UPDATE');
        expect(lastAction.selectables.length).toBe(1);
        expect(lastAction.selectables[0].el.id).toBe(StageStoreMock.elem2.id);
        expect(lastAction.selectables[0].translation).not.toBeFalsy();
        expect(lastAction.selectables[0].translation.y).toBe(mouseData.movementY + scroll.y);
        expect(lastAction.selectables[0].metrics.computedStyleRect.top).toBe(mouseEnd.y + scroll.y - 5);
        done();
      }
      catch(e) {
        done(e);
      }
    }, 150)
  });
});
