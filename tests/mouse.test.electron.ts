import * as electron from 'electron';
import {Mouse, MouseMode} from '../src/ts/Mouse';
import { StageStoreMock } from './flux/StageStoreMock';
import { UiMode } from '../src/ts/Types';

describe('Mouse', function() {
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

    mouse = new Mouse(window, window, stageStoreMock);
    jest.spyOn(mouse, 'onDown');
    jest.spyOn(mouse, 'onUp');
    jest.spyOn(mouse, 'onMove');
    jest.spyOn(mouse, 'onDrag');
    jest.spyOn(mouse, 'onStartDrag');

    // const timeout = 10000;
    // jest.setTimeout(timeout);
    // electron.remote.getCurrentWindow().show();
    // setTimeout(() => { done() }, timeout);
    // return;
    setTimeout(() => { done() }, 0);
  });

  // it('onScroll, a callback should listen for scroll event on mouse', function(done) {
  //   window.scroll(0, 100);
  //   expect(window.scrollY).toBe(100);

  //   // needed to wait i don't know why
  //   setTimeout(() => {
  //     var calls = stageStoreMock.dispatch['mock'].calls;
  //     expect(calls.length).toBe(1);

  //     var lastAction = calls[calls.length - 1][0];
  //     expect(lastAction.type).toBe('MOUSE_SCROLL');
  //     done();
  //   }, 0);
  // });

  // it('mouse modes', function() {
  //   mouse.down(new MouseEvent('mousedown', {
  //     shiftKey: false,
  //   }));
  //   expect(mouse.mouseMode).toBe(MouseMode.DOWN);
  //   mouse.up(new MouseEvent('mouseup', {
  //     shiftKey: false,
  //   }));
  //   expect(mouse.mouseMode).toBe(MouseMode.UP);
  //   mouse.down(new MouseEvent('mousedown', {
  //     shiftKey: false,
  //   }));
  //   expect(mouse.mouseMode).toBe(MouseMode.DOWN);
  //   mouse.move(new MouseEvent('mousemove', {
  //     shiftKey: false,
  //   }));
  //   expect(mouse.mouseMode).toBe(MouseMode.DRAGGING);
  // });

  // it('selection', function() {
  //   StageStoreMock.elem1.dispatchEvent(new MouseEvent('mousedown', {
  //     shiftKey: false,
  //     clientX: 110,
  //     clientY: 110,
  //   }));
  //   expect(mouse.onDown).toBeCalledTimes(1);
  //   expect(stageStoreMock.dispatch).toBeCalledTimes(1);
  //   var calls = stageStoreMock.dispatch['mock'].calls;
  //   expect(calls[calls.length - 1][0].type).toBe('SELECTION_SET');

  //   StageStoreMock.elem1.dispatchEvent(new MouseEvent('mouseup', {
  //     shiftKey: false,
  //   }));
  //   expect(mouse.onUp).toBeCalledTimes(1);
  // });

  it('multi selection', function(done) {
    // select elem1
    StageStoreMock.elem1.dispatchEvent(new MouseEvent('mousedown', {
      shiftKey: true,
      clientX: 110,
      clientY: 110,
    }));
    expect(mouse.onDown).toBeCalledTimes(1);
    expect(stageStoreMock.dispatch).toBeCalledTimes(1);
    var calls = stageStoreMock.dispatch['mock'].calls;
    expect(calls[calls.length - 1][0].type).toBe('SELECTION_ADD');
    expect(calls[calls.length - 1][0].selectable.el).toBe(StageStoreMock.elem1);
    stageStoreMock.selectableElem1.selected = true;

    StageStoreMock.elem1.dispatchEvent(new MouseEvent('mouseup', {
      shiftKey: true,
    }));
    expect(mouse.onUp).toBeCalledTimes(1);

    window.scroll(1000, 1000);

    // select elem2
    StageStoreMock.elem2.dispatchEvent(new MouseEvent('mousedown', {
      shiftKey: true,
      clientX: 300,
      clientY: 300,
    }));

    expect(mouse.onDown).toBeCalledTimes(2);
    expect(stageStoreMock.dispatch).toBeCalledTimes(2);
    var calls = stageStoreMock.dispatch['mock'].calls;
    expect(calls[calls.length - 1][0].type).toBe('SELECTION_ADD');
    expect(calls[calls.length - 1][0].selectable.el).toBe(StageStoreMock.elem2);
    stageStoreMock.selectableElem2.selected = true;

    StageStoreMock.elem2.dispatchEvent(new MouseEvent('mouseup', {
      shiftKey: true,
    }));
    expect(mouse.onUp).toBeCalledTimes(2);
    expect(stageStoreMock.dispatch).toBeCalledTimes(2);

    // deselect elem2
    stageStoreMock.selectableElem2.selected = true;
    StageStoreMock.elem2.dispatchEvent(new MouseEvent('mousedown', {
      shiftKey: true,
      clientX: 300,
      clientY: 300,
    }));
    expect(mouse.onDown).toBeCalledTimes(3);
    expect(stageStoreMock.dispatch).toBeCalledTimes(3);
    StageStoreMock.elem2.dispatchEvent(new MouseEvent('mouseup', {
      shiftKey: true,
    }));
    expect(mouse.onUp).toBeCalledTimes(3);
    var calls = stageStoreMock.dispatch['mock'].calls;
    expect(calls[calls.length - 1][0].type).toBe('SELECTION_REMOVE');
    stageStoreMock.selectableElem2.selected = false;

    done();
  });
});
