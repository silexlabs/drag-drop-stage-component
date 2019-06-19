import * as electron from 'electron';
import {Mouse, MouseMode} from '../src/ts/Mouse';
import { StageStoreMock, hooks } from './flux/StageStoreMock';
import { UiMode } from '../src/ts/Types';

async function wait(delay) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  })
}

describe('Mouse', function() {

  function init() {
    mouse = new Mouse(window, window, stageStoreMock, hooks);
    jest.spyOn(mouse, 'onDblClick');
    jest.spyOn(mouse, 'onDown');
    jest.spyOn(mouse, 'onUp');
    jest.spyOn(mouse, 'onMove');
    jest.spyOn(mouse, 'onDrag');
    jest.spyOn(mouse, 'onStartDrag');
  }

  var stageStoreMock: StageStoreMock;
  var elem3;
  var elem4;
  var mouse: Mouse;
  beforeEach(function (done) {
    document.body.innerHTML = `
      <style>
        .elem {
          margin: 1000px;
          border: 1px solid;
        }
        #elem1 {
          background: green;
          margin: 0;
          top: 100px;
          left: 100px;
          width: 100px;
          height: 100px;
          position: absolute;
        }
        #elem2 {
          background: blue;
          position: absolute;
          top: 1000px;
          left: 1000px;
          min-width: 10000px;
          min-height: 10000px;
          margin: 0;
        }
         #elem3 {
          background: yellow;
          margin: 0;
          top: 1050px;
          left: 1050px;
          width: 100px;
          height: 100px;
          position: absolute;
          z-index: 1000;
        }
        #elem4 {
          background: yellow;
          margin: 0;
          top: 300000;
          left: 300000;
          width: 100px;
          height: 100px;
          position: absolute;
          z-index: 2000;
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

    init();

    // const timeout = 10000;
    // jest.setTimeout(timeout);
    // electron.remote.getCurrentWindow().show();
    // setTimeout(() => { done() }, timeout);
    // return;
    setTimeout(() => { done() }, 0);
  });

  it('onScroll, a callback should listen for scroll event on mouse', function(done) {
    window.scroll(0, 100);
    expect(window.scrollY).toBe(100);

    // needed to wait i don't know why
    setTimeout(() => {
      try {
        var calls = stageStoreMock.dispatch['mock'].calls;
        expect(calls.length).toBe(1);

        var lastAction = calls[calls.length - 1][0];
        expect(lastAction.type).toBe('MOUSE_SCROLL');
        done();
      }
      catch(e) {
        done(e)
      }
    }, 100);
  });

  it('mouse modes', async () => {
    mouse.down(new MouseEvent('mousedown', {
      shiftKey: false,
    }));
    await wait(400); // for dbl click detection
    expect(mouse.mouseMode).toBe(MouseMode.DOWN);

    mouse.up(new MouseEvent('mouseup', {
      shiftKey: false,
    }));
    expect(mouse.mouseMode).toBe(MouseMode.UP);

    mouse.down(new MouseEvent('mousedown', {
      shiftKey: false,
    }));
    await wait(400); // for dbl click detection
    expect(mouse.mouseMode).toBe(MouseMode.DOWN);

    mouse.move(new MouseEvent('mousemove', {
      shiftKey: false,
    }));
    expect(mouse.mouseMode).toBe(MouseMode.DRAGGING);
  });

  it('selection', async () => {
    mouse.onDown({
      shiftKey: false,
      mouseX: 110,
      mouseY: 110,
      movementX: 0,
      movementY: 0,
      target: StageStoreMock.elem1,
    });
    await wait(400); // for dbl click detection
    expect(stageStoreMock.dispatch).toBeCalledTimes(1);
    var calls = stageStoreMock.dispatch['mock'].calls;
    expect(calls[calls.length - 1][0].type).toBe('SELECTION_SET');
  });

  it('multi selection', async () => {
    // select elem1
    mouse.onDown({
      shiftKey: true,
      mouseX: 110,
      mouseY: 110,
      movementX: 0,
      movementY: 0,
      target: StageStoreMock.elem1,
    });
    await wait(400); // for dbl click detection
    expect(stageStoreMock.dispatch).toBeCalledTimes(1);
    var calls = stageStoreMock.dispatch['mock'].calls;
    expect(calls[calls.length - 1][0].type).toBe('SELECTION_ADD');
    expect(calls[calls.length - 1][0].selectable.el).toBe(StageStoreMock.elem1);
    stageStoreMock.selectableElem1.selected = true;
    mouse.mouseMode = MouseMode.UP; // reset state

    // select elem2
    mouse.onDown({
      shiftKey: true,
      mouseX: 300,
      mouseY: 300,
      movementX: 0,
      movementY: 0,
      target: StageStoreMock.elem2,
    });
    await wait(400); // for dbl click detection
    expect(stageStoreMock.dispatch).toBeCalledTimes(2);
    var calls = stageStoreMock.dispatch['mock'].calls;
    expect(calls[calls.length - 1][0].type).toBe('SELECTION_ADD');
    expect(calls[calls.length - 1][0].selectable.el).toBe(StageStoreMock.elem2);
    stageStoreMock.selectableElem2.selected = true;

    mouse.onUp({
      shiftKey: true,
      mouseX: 300,
      mouseY: 300,
      movementX: 0,
      movementY: 0,
      target: StageStoreMock.elem2,
    });
    expect(stageStoreMock.dispatch).toBeCalledTimes(2);

    // deselect elem2
    stageStoreMock.selectableElem2.selected = true;
    mouse.onDown({
      shiftKey: true,
      mouseX: 300,
      mouseY: 300,
      movementX: 0,
      movementY: 0,
      target: StageStoreMock.elem2,
    });
    await wait(400); // for dbl click detection
    expect(stageStoreMock.dispatch).toBeCalledTimes(3);
    mouse.onUp({
      shiftKey: true,
      mouseX: 300,
      mouseY: 300,
      movementX: 0,
      movementY: 0,
      target: StageStoreMock.elem2,
    });
    var calls = stageStoreMock.dispatch['mock'].calls;
    expect(calls[calls.length - 1][0].type).toBe('SELECTION_REMOVE');
    stageStoreMock.selectableElem2.selected = false;
  });

  it('double click', async () => {
    mouse.down(new MouseEvent('down'));
    expect(mouse.onDown).toBeCalledTimes(0);
    expect(mouse.onUp).toBeCalledTimes(0);

    mouse.up(new MouseEvent('up'));
    expect(mouse.onDown).toBeCalledTimes(0);
    expect(mouse.onUp).toBeCalledTimes(0);

    mouse.down(new MouseEvent('down'));
    mouse.up(new MouseEvent('up'));
    expect(mouse.onDblClick).toBeCalledTimes(1);
    expect(mouse.onDown).toBeCalledTimes(0);
    expect(mouse.onUp).toBeCalledTimes(0);
    await wait(400); // for dbl click detection

    expect(mouse.onDown).toBeCalledTimes(0);
    expect(mouse.onUp).toBeCalledTimes(0);
  });

  it('double click abort', async () => {
    mouse.down(new MouseEvent('down'));
    mouse.move(new MouseEvent('move'));
    expect(mouse.onDown).toBeCalledTimes(1);
    expect(mouse.onStartDrag).toBeCalledTimes(1);

    init();

    mouse.down(new MouseEvent('down'));
    mouse.up(new MouseEvent('up'));
    mouse.move(new MouseEvent('move'));
    expect(mouse.onDown).toBeCalledTimes(1);
    expect(mouse.onUp).toBeCalledTimes(1);
    expect(mouse.onMove).toBeCalledTimes(1);
    expect(mouse.onStartDrag).toBeCalledTimes(0);

  });

  it('double click abort with move', () => {
    const start = {
      clientX: 10,
      clientY: 10,
    };
    const end = {
      clientX: 20,
      clientY: 20,
      movementX: 10,
      movementY: 10,
    };
    const startExpected = {
      mouseX: 10,
      mouseY: 10,
    };
    const endExpected = {
      mouseX: 20,
      mouseY: 20,
      movementX: 10,
      movementY: 10,
    };

    mouse.down(new MouseEvent('down', start));
    mouse.move(new MouseEvent('move', end));
    expect(mouse.onDown).toBeCalledTimes(1);
    expect(mouse.onDown).toBeCalledWith(expect.objectContaining(startExpected));
    expect(mouse.onStartDrag).toBeCalledTimes(1);
    expect(mouse.onStartDrag).toBeCalledWith(expect.objectContaining(endExpected));

    init();

    mouse.down(new MouseEvent('down', start));
    mouse.up(new MouseEvent('up', start));
    mouse.down(new MouseEvent('down', start));
    mouse.move(new MouseEvent('move', end));
    expect(mouse.onDown).toBeCalledTimes(1);
    expect(mouse.onDown).toBeCalledWith(expect.objectContaining(startExpected));
    expect(mouse.onStartDrag).toBeCalledTimes(1);
    expect(mouse.onStartDrag).toBeCalledWith(expect.objectContaining(endExpected));

  });
});
