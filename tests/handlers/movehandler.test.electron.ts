import { MoveHandler } from '../../src/ts/handlers/MoveHandler';
import { hooks, StageStoreMock } from '../flux/StageStoreMock';

describe('MoveHandler', function() {

  var elem3;
  var stageStoreMock: StageStoreMock;
  var handler: MoveHandler;

  function initHandler() {
    const handler = new MoveHandler(document, stageStoreMock, hooks);
    jest.spyOn(handler, 'update');
    jest.spyOn(handler, 'release');
    jest.spyOn(handler, 'move');
    jest.spyOn(handler, 'updateDestinationAbsolute');
    jest.spyOn(handler, 'updateDestinationNonAbsolute');
    jest.spyOn(handler, 'markPosition');
    jest.spyOn(handler, 'findDropZonesUnderMouse');
    jest.spyOn(handler, 'findNearestPosition');
    return handler;
  }

  beforeEach(function () {
    document.head.innerHTML = `<style>
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
    }
    #elem2 {
      position: absolute;
      top: 10px;
      left: 10px;
      width: 10px;
      height: 10px;
    }
    </style>`;

    document.body.innerHTML = `
      <div id="container1">
        <div class="selectable draggable" id="elem1"></div>
        <div class="selectable draggable" id="elem2"></div>
        <div class="selectable draggable" id="elem3"></div>
      </div>
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

  it('should move an absolute element in the dom', function() {
    // init
    stageStoreMock.selectableElem1.selected = true;
    handler = initHandler();
    expect(handler.selection.length).toBe(1);
    expect(handler.selection[0].el).toBe(StageStoreMock.elem1);
    expect(handler.selection[0].metrics.clientRect.top).toBe(100);
    expect(stageStoreMock.subscribe).toBeCalledTimes(1);

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
    expect(stageStoreMock.dispatch).toBeCalledTimes(1);
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 1][0];
    expect(lastAction.type).toBe('SELECTABLE_UPDATE');
    expect(lastAction.selectables.length).toBe(1);
    expect(lastAction.selectables[0].el).toBe(StageStoreMock.elem1);
    expect(lastAction.selectables[0].metrics.clientRect.top).toBe(200);
  });

  it('should move an element in the flow', function() {
    // init
    stageStoreMock.selectableElem2.selected = true;
    stageStoreMock.selectableElem2.metrics.position = 'static';
    handler = initHandler();

    // test
    var mouseData = {
      movementY: 150 - 15, // from middle of elem2
      movementX: 150 - 15, // from middle of elem2
      mouseX: 150, // to middle of elem1
      mouseY: 150, // to middle of elem1
      shiftKey: false,
      target: StageStoreMock.elem2,
    };
    stageStoreMock.mouseState.mouseData = mouseData;
    handler.update(mouseData);
    handler.release();
    expect(stageStoreMock.dispatch).toBeCalledTimes(2);
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 1][0];
    expect(lastAction.type).toBe('SELECTABLE_UPDATE');
    expect(lastAction.selectables.length).toBe(1);
    expect(lastAction.selectables[0].el).toBe(StageStoreMock.elem2);
    expect(lastAction.selectables[0].el.parentElement).toBe(StageStoreMock.elem1);
    expect(lastAction.selectables[0].metrics.clientRect.top).toBe(145);
  });

  it('should find 1 droppable at (150, 150) while dragging elem1', function() {
    // init
    stageStoreMock.selectableElem2.selected = true;
    stageStoreMock.selectableElem2.metrics.position = 'static';
    handler = initHandler();

    // test
    var droppables = handler.findDropZonesUnderMouse(150, 150);
    expect(droppables instanceof Array).toBe(true);
    expect(droppables.length).toBe(2);
    expect(droppables[0]).toBe(StageStoreMock.elem1);
  });

  it('move to a new container, keep the position', function() {
    // init
    stageStoreMock.selectableElem1.selected = false;
    stageStoreMock.selectableElem1.isDropZone = true;
    stageStoreMock.selectableElem2.selected = true;
    stageStoreMock.selectableElem2.metrics.position = 'absolute';
    handler = initHandler();
    expect(handler.selection.length).toBe(1);
    expect(handler.selection[0].el).toBe(StageStoreMock.elem2);
    expect(handler.selection[0].metrics.clientRect.top).toBe(10);
    expect(handler.selection[0].metrics.position).toBe('absolute');
    expect(stageStoreMock.subscribe).toBeCalledTimes(1);

    // test
    var mouseData = {
      movementY: 150 - 15, // from middle of elem2
      movementX: 150 - 15, // from middle of elem2
      mouseX: 150, // to middle of elem1
      mouseY: 150, // to middle of elem1
      shiftKey: false,
      target: StageStoreMock.elem2,
    };
    stageStoreMock.mouseState.mouseData = mouseData;
    handler.update(mouseData);
    handler.release();
    expect(stageStoreMock.dispatch).toBeCalledTimes(2);
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 1][0];
    expect(lastAction.type).toBe('SELECTABLE_UPDATE');
    expect(lastAction.selectables.length).toBe(1);
    expect(lastAction.selectables[0].el).toBe(StageStoreMock.elem2);
    expect(lastAction.selectables[0].metrics.clientRect.top).toBe(145);
    expect(lastAction.selectables[0].metrics.computedStyleRect.top).toBe(145 - 100);
  });
});
