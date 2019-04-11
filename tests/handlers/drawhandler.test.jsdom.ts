import { DrawHandler } from '../../src/ts/handlers/DrawHandler';
import { hooks, StageStoreMock } from '../flux/StageStoreMock';



describe('DrawHandler', function() {

  var elem3;
  var stageStoreMock: StageStoreMock;
  var handler: DrawHandler;

  beforeEach(function () {
    document.body.innerHTML = `
      <div class="selectable" id="elem1"></div>
      <div class="selectable" id="elem2"></div>
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

    handler = new DrawHandler(document, stageStoreMock, hooks);
    jest.spyOn(handler, 'update');
    jest.spyOn(handler, 'release');
    jest.spyOn(handler, 'moveRegion');
  });

  it('should select 1, 2 and 3 elements in the dom', function() {
    var mouseData = {
      mouseX: 15,
      movementX: 1,
      mouseY: 15,
      movementY: 1,
      shiftKey: false,
      target: document.body,
    };
    stageStoreMock.mouseState.mouseData = mouseData;
    handler.update(mouseData);
    expect(stageStoreMock.dispatch).toBeCalledTimes(1);
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 1][0];
    expect(lastAction.type).toBe('SELECTION_ADD');
    expect(lastAction.selectable.el).toBe(StageStoreMock.elem2);
    stageStoreMock.selectableElem2.selected = true;

    var mouseData = {
      mouseX: 115,
      movementX: 100,
      mouseY: 115,
      movementY: 100,
      shiftKey: false,
      target: document.body,
    };
    stageStoreMock.mouseState.mouseData = mouseData;
    handler.update(mouseData);
    expect(stageStoreMock.dispatch).toBeCalledTimes(2);
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 1][0];
    expect(lastAction.type).toBe('SELECTION_ADD');
    expect(lastAction.selectable.el).toBe(StageStoreMock.elem1);

    stageStoreMock.selectableElem1.selected = true;

    handler.release();
    expect(handler.regionMarker.parentNode).toBeNull();
    expect(handler.selection.length).toBe(0);
  });

  it('should un-select 1, 2 and 3 elements in the dom', function() {
    var mouseData = {
      mouseX: 115,
      movementX: 100,
      mouseY: 115,
      movementY: 100,
      shiftKey: false,
      target: document.body,
    };
    stageStoreMock.mouseState.mouseData = mouseData;
    handler.update(mouseData);
    expect(handler.selection.length).toBe(2);
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 1][0];
    expect(lastAction.type).toBe('SELECTION_ADD');

    var mouseData = {
      mouseX: 15,
      movementX: -100,
      mouseY: 15,
      movementY: -100,
      shiftKey: false,
      target: document.body,
    };
    stageStoreMock.mouseState.mouseData = mouseData;
    handler.update(mouseData);
    expect(handler.selection.length).toBe(1);
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 1][0];
    expect(lastAction.type).toBe('SELECTION_REMOVE');
    expect(lastAction.selectable.el).toBe(StageStoreMock.elem1);

    handler.release();
  });
});
