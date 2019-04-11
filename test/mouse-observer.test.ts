import {MouseObserver} from '../src/ts/observers/MouseObserver';
import {StageStoreMock, hooks} from './StageStoreMock';

describe('MouseObserver', function() {
  var observer;
  var stageStoreMock: StageStoreMock;

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

    StageStoreMock.elem1 = document.querySelector('#elem1');
    StageStoreMock.elem2 = document.querySelector('#elem2');

    stageStoreMock = new StageStoreMock()
    jest.spyOn(stageStoreMock, 'subscribe');
    jest.spyOn(stageStoreMock, 'dispatch');
    jest.spyOn(stageStoreMock, 'getState');

    observer = new MouseObserver(document, stageStoreMock, hooks);
    jest.spyOn(observer, 'onStateChanged');
  });

  it('init', function() {
    expect(stageStoreMock.subscribe).toHaveBeenCalledTimes(1);
    expect(stageStoreMock.getState().mouse.scrollData.x).toBe(0);

    expect(window.scrollY).toBe(0);
  });

  it('onStateChanged', function() {
    // scroll
    // SCROLL TEST CAN NOT BE RUN BECAUSE window.scroll IS NOT IMPLEMENTED IN JsDom
    // stageStoreMock.state = {
    //   ...stageStoreMock.state,
    //   mouse: {
    //     ...stageStoreMock.state.mouse,
    //     scrollData: {
    //       x: 0,
    //       y: 100,
    //     }
    //   }
    // };
    // stageStoreMock.dispatch(null);
    // expect(window.scrollX).toBe(0);
    // expect(window.scrollY).toBe(100);
    // css class
    stageStoreMock.state = {
      ...stageStoreMock.state,
      mouse: {
        ...stageStoreMock.state.mouse,
        cursorData: {
          y: '',
          x: '',
          cssClass: 'test-class',
        }
      }
    };
    stageStoreMock.dispatch(null);
    expect(document.body.className).toBe('test-class');
    // target
    stageStoreMock.state = {
      ...stageStoreMock.state,
      mouse: {
        ...stageStoreMock.state.mouse,
        mouseData: {
          ...stageStoreMock.state.mouse.mouseData,
          target: StageStoreMock.elem1,
        }
      }
    };
    stageStoreMock.dispatch(null);
    expect(StageStoreMock.elem1.classList.contains('hovered')).toBe(true);
  });
});
