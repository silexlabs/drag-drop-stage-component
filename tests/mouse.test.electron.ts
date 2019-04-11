import {Mouse, MouseMode} from '../src/ts/Mouse';
import { StageStoreMock } from './flux/StageStoreMock';
import { UiMode } from '../src/ts/Types';

describe('Mouse', function() {
  var stageStoreMock: StageStoreMock;
  var elem3;
  var elem4;
  var mouse;
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
      <div class="elem i-am-selectable" id="elem1">
        <div class="elem" id="elem3"></div>
      </div>
      <div class="elem i-am-selectable" id="elem2"></div>
      <div class="elem" id="elem4"></div>
    </div>
    `;

    StageStoreMock.elem1 = document.querySelector('#elem1');
    StageStoreMock.elem2 = document.querySelector('#elem2');
    elem3 = document.querySelector('#elem3');
    elem4 = document.querySelector('#elem4');

    stageStoreMock = new StageStoreMock();
    jest.spyOn(stageStoreMock, 'subscribe');
    jest.spyOn(stageStoreMock, 'dispatch');
    jest.spyOn(stageStoreMock, 'getState');

    mouse = new Mouse(window, stageStoreMock);
    jest.spyOn(mouse, 'onDown');
    jest.spyOn(mouse, 'onUp');
    jest.spyOn(mouse, 'onMove');
    jest.spyOn(mouse, 'onDrag');
    jest.spyOn(mouse, 'onStartDrag');
  });

  it('getSelectable', function() {
    const selectable1 = mouse.getSelectable(StageStoreMock.elem1);
    expect(selectable1).not.toBeNull();
    expect(selectable1.el).toBe(StageStoreMock.elem1);

    const selectable3 = mouse.getSelectable(elem3);
    expect(selectable3).not.toBeNull();
    expect(selectable3.el).toBe(StageStoreMock.elem1);
  });

  it('hasASelectedDraggableParent', function() {
    stageStoreMock.selectableElem1.selected = true;
    const result1 = mouse.hasASelectedDraggableParent(StageStoreMock.elem1);
    expect(result1).toBe(false);

    const result2 = mouse.hasASelectedDraggableParent(StageStoreMock.elem2);
    expect(result2).toBe(false);

    const result3 = mouse.hasASelectedDraggableParent(elem3);
    expect(result3).toBe(true);
  });

  it('onScroll, a callback should listen for scroll event on mouse', function(done) {
    window.scroll(0, 100);
    expect(window.scrollY).toBe(100);

    // needed to wait i don't know why
    setTimeout(() => {
      var calls = stageStoreMock.dispatch['mock'].calls;
      expect(calls.length).toBe(1);

      var lastAction = calls[calls.length - 1][0];
      expect(lastAction.type).toBe('MOUSE_SCROLL');
      done();
    }, 0);
  });

  it('mouse modes', function() {
    mouse.down(new MouseEvent('down', {
      shiftKey: false,
    }));
    expect(mouse.mouseMode).toBe(MouseMode.DOWN);
    mouse.up(new MouseEvent('up', {
      shiftKey: false,
    }));
    expect(mouse.mouseMode).toBe(MouseMode.UP);
    mouse.down(new MouseEvent('down', {
      shiftKey: false,
    }));
    expect(mouse.mouseMode).toBe(MouseMode.DOWN);
    mouse.move(new MouseEvent('move', {
      shiftKey: false,
    }));
    expect(mouse.mouseMode).toBe(MouseMode.DRAGGING);
  });

  it('selection', function() {
    StageStoreMock.elem1.dispatchEvent(new MouseEvent('down', {
      shiftKey: false,
    }));
    expect(mouse.onDown).toBeCalledTimes(1);
    expect(stageStoreMock.dispatch).toBeCalledTimes(1);
    var calls = stageStoreMock.dispatch['mock'].calls;
    expect(calls[calls.length - 1][0].type).toBe('SELECTION_SET');

    StageStoreMock.elem1.dispatchEvent(new MouseEvent('up', {
      shiftKey: false,
    }));
    expect(mouse.onUp).toBeCalledTimes(1);
  });

  it('multi selection', function() {
    // select elem1
    StageStoreMock.elem1.dispatchEvent(new MouseEvent('down', {
      shiftKey: true,
    }));
    expect(mouse.onDown).toBeCalledTimes(1);
    expect(stageStoreMock.dispatch).toBeCalledTimes(1);
    var calls = stageStoreMock.dispatch['mock'].calls;
    expect(calls[calls.length - 1][0].type).toBe('SELECTION_ADD');

    StageStoreMock.elem1.dispatchEvent(new MouseEvent('up', {
      shiftKey: true,
    }));
    expect(mouse.onUp).toBeCalledTimes(1);

    // select elem2
    StageStoreMock.elem2.dispatchEvent(new MouseEvent('down', {
      shiftKey: true,
    }));
    expect(mouse.onDown).toBeCalledTimes(2);
    expect(stageStoreMock.dispatch).toBeCalledTimes(2);
    var calls = stageStoreMock.dispatch['mock'].calls;
    expect(calls[calls.length - 1][0].type).toBe('SELECTION_ADD');

    StageStoreMock.elem2.dispatchEvent(new MouseEvent('up', {
      shiftKey: true,
    }));
    expect(mouse.onUp).toBeCalledTimes(2);

    // deselect elem2
    stageStoreMock.selectableElem2.selected = true;
    StageStoreMock.elem2.dispatchEvent(new MouseEvent('down', {
      shiftKey: true,
    }));
    expect(mouse.onDown).toBeCalledTimes(3);
    expect(stageStoreMock.dispatch).toBeCalledTimes(3);
    StageStoreMock.elem2.dispatchEvent(new MouseEvent('up', {
      shiftKey: true,
    }));
    expect(mouse.onUp).toBeCalledTimes(3);
    var calls = stageStoreMock.dispatch['mock'].calls;
    expect(calls[calls.length - 1][0].type).toBe('SELECTION_REMOVE');

    // reset selection,
    elem4.dispatchEvent(new MouseEvent('down', {
      shiftKey: false,
    }));
    elem4.dispatchEvent(new MouseEvent('up', {
      shiftKey: false,
    }));
    var calls = stageStoreMock.dispatch['mock'].calls;
    expect(calls[calls.length - 1][0].type).toBe('SELECTION_RESET');
  });

  it('app modes', function() {
    // draw,
    elem4.dispatchEvent(new MouseEvent('down', {
      shiftKey: false,
    }));
    elem4.dispatchEvent(new MouseEvent('move', {
      shiftKey: false,
    }));
    var calls = stageStoreMock.dispatch['mock'].calls;
    expect(calls[calls.length - 1][0].type).toBe('UI_SET_MODE');
    expect(calls[calls.length - 1][0].mode).toBe(UiMode.DRAW);
    elem4.dispatchEvent(new MouseEvent('up', {
      shiftKey: false,
    }));

    // drag,
    StageStoreMock.elem1.dispatchEvent(new MouseEvent('down', {
      shiftKey: false,
    }));
    StageStoreMock.elem1.dispatchEvent(new MouseEvent('move', {
      shiftKey: false,
    }));
    var calls = stageStoreMock.dispatch['mock'].calls;
    expect(calls[calls.length - 1][0].type).toBe('UI_SET_MODE');
    expect(calls[calls.length - 1][0].mode).toBe(UiMode.DRAG);
    StageStoreMock.elem1.dispatchEvent(new MouseEvent('up', {
      shiftKey: false,
    }));
  });
});
