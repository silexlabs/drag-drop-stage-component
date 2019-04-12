import {MouseObserver} from '../../src/ts/observers/MouseObserver';
import {StageStoreMock, hooks} from '../flux/StageStoreMock';

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
    stageStoreMock.state = {
      ...stageStoreMock.state,
      mouse: {
        ...stageStoreMock.state.mouse,
        scrollData: {
          x: 0,
          y: 100,
        }
      }
    };
    stageStoreMock.dispatch(null);
    expect(window.scrollX).toBe(0);
    expect(window.scrollY).toBe(100);

    // css class
    stageStoreMock.state = {
      ...stageStoreMock.state,
      mouse: {
        ...stageStoreMock.state.mouse,
        cursorData: {
          y: '',
          x: '',
          cursorType: 'alias',
        }
      }
    };
    stageStoreMock.dispatch(null);
    expect(document.body.style.cursor).toBe('alias');
  });
});
