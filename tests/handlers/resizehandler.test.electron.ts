import {ResizeHandler} from '../../src/ts/handlers/ResizeHandler';
import { hooks, StageStoreMock } from '../flux/StageStoreMock';

describe('ResizeHandler', function() {

  var elem3;
  var stageStoreMock: StageStoreMock;
  function initHandler() {
    var handler = new ResizeHandler(document, stageStoreMock, hooks);
    jest.spyOn(handler, 'update');
    jest.spyOn(handler, 'release');
    return handler;
  }

  beforeEach(function () {
    document.body.innerHTML = `
      <style>
        .minsize {
          min-height: 5px;
          min-width: 5px;
        }
      </style>
      <div class="selectable" id="elem1"></div>
      <div class="selectable" id="elem2">
        <div class="minsize"></div>
      </div>
      <div class="selectable" id="elem3"></div>
    `;

    StageStoreMock.elem1 = document.querySelector('#elem1');
    StageStoreMock.elem2 = document.querySelector('#elem2');
    elem3 = document.querySelector('#elem3');

    stageStoreMock = new StageStoreMock();
    stageStoreMock.preventDispatch = true;
    jest.spyOn(stageStoreMock, 'subscribe');
    jest.spyOn(stageStoreMock, 'dispatch');
    jest.spyOn(stageStoreMock, 'getState');
  });

  it('should resize 1 element from the bottom right corner', function() {
    stageStoreMock.selectableElem1.selected = false;
    stageStoreMock.selectableElem2.selected = true;

    var handler = initHandler();
    expect(handler.selection.length).toBe(1);

    var mouseState = {
      scrollData: {x: 0, y: 0},
      cursorData: {x: 'right', y: 'bottom', cursorType: ''},
      mouseData: {
        mouseX: 120,
        movementX: 100,
        mouseY: 120,
        movementY: 100,
        shiftKey: false,
        target: document.body,
      }
    };
    stageStoreMock.mouseState.mouseData = mouseState.mouseData;
    stageStoreMock.mouseState.cursorData = mouseState.cursorData;
    stageStoreMock.mouseState.scrollData = mouseState.scrollData;
    handler.update(mouseState.mouseData);
    expect(stageStoreMock.dispatch).toBeCalledTimes(1);
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 1][0];
    expect(lastAction.type).toBe('SELECTABLE_UPDATE');
    expect(lastAction.selectables.length).toBe(1);
    expect(lastAction.selectables[0].el).toBe(StageStoreMock.elem2);
    expect(lastAction.selectables[0].metrics.clientRect.width).toBe(110);
    expect(lastAction.selectables[0].metrics.clientRect.height).toBe(110);
  });

  it('should resize 2 elements from the bottom right corner', function() {
    stageStoreMock.selectableElem1.selected = true;
    stageStoreMock.selectableElem2.selected = true;

    var handler = initHandler();
    expect(handler.selection.length).toBe(2);

    var mouseState = {
      scrollData: {x: 0, y: 0},
      cursorData: {x: 'right', y: 'bottom', cursorType: ''},
      mouseData: {
        mouseX: 120,
        movementX: 100,
        mouseY: 120,
        movementY: 100,
        shiftKey: false,
        target: document.body,
      }
    };
    stageStoreMock.mouseState.mouseData = mouseState.mouseData;
    stageStoreMock.mouseState.cursorData = mouseState.cursorData;
    stageStoreMock.mouseState.scrollData = mouseState.scrollData;
    handler.update(mouseState.mouseData);
    expect(stageStoreMock.dispatch).toBeCalledTimes(1);
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 1][0];
    expect(lastAction.type).toBe('SELECTABLE_UPDATE');
    expect(lastAction.selectables.length).toBe(2);
    expect(lastAction.selectables[1].el).toBe(StageStoreMock.elem2);
    expect(lastAction.selectables[1].metrics.clientRect.width).toBe(110);
    expect(lastAction.selectables[1].metrics.clientRect.height).toBe(110);
    expect(lastAction.selectables[0].el).toBe(StageStoreMock.elem1);
    expect(lastAction.selectables[0].metrics.clientRect.width).toBe(200);
    expect(lastAction.selectables[0].metrics.clientRect.height).toBe(200);
  });

  it('should resize 1 element from the top left corner', function() {
    stageStoreMock.selectableElem1.selected = false;
    stageStoreMock.selectableElem2.selected = true;

    var handler = initHandler();
    expect(handler.selection.length).toBe(1);

    var mouseState = {
      scrollData: {x: 0, y: 0},
      cursorData: {x: 'left', y: 'top', cursorType: ''},
      mouseData: {
        mouseX: 0,
        movementX: -10,
        mouseY: 0,
        movementY: -10,
        shiftKey: false,
        target: document.body,
      }
    };
    stageStoreMock.mouseState.mouseData = mouseState.mouseData;
    stageStoreMock.mouseState.cursorData = mouseState.cursorData;
    stageStoreMock.mouseState.scrollData = mouseState.scrollData;
    handler.update(mouseState.mouseData);
    expect(stageStoreMock.dispatch).toBeCalledTimes(1);
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 1][0];
    expect(lastAction.type).toBe('SELECTABLE_UPDATE');
    expect(lastAction.selectables.length).toBe(1);
    expect(lastAction.selectables[0].el).toBe(StageStoreMock.elem2);
    expect(lastAction.selectables[0].metrics.clientRect.width).toBe(20);
    expect(lastAction.selectables[0].metrics.clientRect.height).toBe(20);
    expect(lastAction.selectables[0].metrics.clientRect.left).toBe(0);
    expect(lastAction.selectables[0].metrics.clientRect.top).toBe(0);
  });

  it('should resize 1 element and keep proporitions', function() {
    stageStoreMock.selectableElem1.selected = false;
    stageStoreMock.selectableElem2.selected = true;

    var handler = initHandler();
    expect(handler.selection.length).toBe(1);

    var mouseState = {
      scrollData: {x: 0, y: 0},
      cursorData: {x: 'right', y: 'bottom', cursorType: ''},
      mouseData: {
        mouseX: 120,
        movementX: 100,
        mouseY: 20,
        movementY: 0,
        shiftKey: true,
        target: document.body,
      }
    };
    stageStoreMock.mouseState.mouseData = mouseState.mouseData;
    stageStoreMock.mouseState.cursorData = mouseState.cursorData;
    stageStoreMock.mouseState.scrollData = mouseState.scrollData;
    handler.update(mouseState.mouseData);
    expect(stageStoreMock.dispatch).toBeCalledTimes(1);
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 1][0];
    expect(lastAction.type).toBe('SELECTABLE_UPDATE');
    expect(lastAction.selectables.length).toBe(1);
    expect(lastAction.selectables[0].el).toBe(StageStoreMock.elem2);
    expect(lastAction.selectables[0].metrics.clientRect.width).toBe(110);
    expect(lastAction.selectables[0].metrics.clientRect.height).toBe(110);
  });

  it('should try resize to 1 element from the top but can not because of its content', function() {
    stageStoreMock.selectableElem1.selected = false;
    stageStoreMock.selectableElem2.selected = true;

    var handler = initHandler();
    expect(handler.selection.length).toBe(1);

    var mouseState = {
      scrollData: {x: 0, y: 0},
      cursorData: {x: 'left', y: 'top', cursorType: ''},
      mouseData: {
        mouseX: 20,
        movementX: 10,
        mouseY: 20,
        movementY: 10,
        shiftKey: false,
        target: document.body,
      }
    };
    stageStoreMock.mouseState.mouseData = mouseState.mouseData;
    stageStoreMock.mouseState.cursorData = mouseState.cursorData;
    stageStoreMock.mouseState.scrollData = mouseState.scrollData;
    handler.update(mouseState.mouseData);
    expect(stageStoreMock.dispatch).toBeCalledTimes(1);
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 1][0];
    expect(lastAction.type).toBe('SELECTABLE_UPDATE');
    expect(lastAction.selectables.length).toBe(1);
    expect(lastAction.selectables[0].el).toBe(StageStoreMock.elem2);
    expect(lastAction.selectables[0].metrics.clientRect.width).toBe(0);
    expect(lastAction.selectables[0].metrics.clientRect.height).toBe(5);
    expect(lastAction.selectables[0].metrics.clientRect.left).toBe(20);
    expect(lastAction.selectables[0].metrics.clientRect.top).toBe(15);
  });
});
