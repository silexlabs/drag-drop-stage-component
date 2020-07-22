import {SelectablesObserver} from '../../src/ts/observers/SelectablesObserver';
import {StageStoreMock, hooks} from '../flux/StageStoreMock';

describe('SelectablesObserver', function() {
  var observer: SelectablesObserver;
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

    observer = new SelectablesObserver(document, document, stageStoreMock, hooks);
    jest.spyOn(observer, 'onStateChanged');
    jest.spyOn(observer, 'onMetrics');
    jest.spyOn(observer, 'onSelection');
  });

  it('init', function() {
    expect(stageStoreMock.subscribe).toHaveBeenCalledTimes(2);
    expect(stageStoreMock.getState().selectables.length).toBe(2);
    expect(stageStoreMock.getState().selectables[0]).toBe(stageStoreMock.selectableElem1);
  });

  it('onStateChanged', function() {
    stageStoreMock.dispatch(null);
    expect(observer.onStateChanged).toBeCalledTimes(1);
    expect(observer.onMetrics).toBeCalledTimes(0);
    expect(observer.onSelection).toBeCalledTimes(0);
  });

  it('onMetrics', function() {
    stageStoreMock.state = {
      ...stageStoreMock.state,
      selectables: [{
        ...stageStoreMock.selectableElem1,
        metrics: {
          proportions: 1,
          position: 'relative',
          margin: {top: 0, left: 0, bottom: 0, right: 0 },
          padding: {top: 0, left: 0, bottom: 0, right: 0 },
          border: {top: 0, left: 0, bottom: 0, right: 0 },
          computedStyleRect: {top: 200, left: 200, bottom: 200, right: 200, width: 100, height: 100 },
          clientRect: {top: 200, left: 200, bottom: 200, right: 200, width: 100, height: 100 },
        },
      },
      stageStoreMock.selectableElem2,
      ],
    };
    stageStoreMock.dispatch(null);
    expect(StageStoreMock.elem1.style.top).toBe('200px');
    expect(observer.onStateChanged).toBeCalledTimes(1);
    expect(observer.onMetrics).toBeCalledTimes(1);
    expect(observer.onSelection).toBeCalledTimes(0);
  });
  it('onSelection', function() {
    const state = stageStoreMock.getState();
    stageStoreMock.state = {
      ...stageStoreMock.state,
      selectables: [{
      ...stageStoreMock.selectableElem1,
      selected: true,
      },
      stageStoreMock.selectableElem2,
      ],
    };
    stageStoreMock.dispatch(null);
    expect(observer.onStateChanged).toBeCalledTimes(1);
    expect(observer.onMetrics).toBeCalledTimes(0);
    expect(observer.onSelection).toBeCalledTimes(1);
  });
  it('onDraggable', function() {
    const state = stageStoreMock.getState();
    stageStoreMock.state = {
      ...stageStoreMock.state,
      selectables: [{
      ...stageStoreMock.selectableElem1,
      draggable: false,
      },
      stageStoreMock.selectableElem2,
      ],
    };
    stageStoreMock.dispatch(null);
    expect(observer.onStateChanged).toBeCalledTimes(1);
    expect(observer.onMetrics).toBeCalledTimes(0);
    expect(observer.onSelection).toBeCalledTimes(0);
  });
  it('onResizeable', function() {
    const state = stageStoreMock.getState();
    stageStoreMock.state = {
      ...stageStoreMock.state,
      selectables: [{
        ...stageStoreMock.selectableElem1,
        resizeable: {
          top: false,
          left: false,
          bottom: false,
          right: false,
        },
      },
      stageStoreMock.selectableElem2,
      ],
    };
    stageStoreMock.dispatch(null);
    expect(observer.onStateChanged).toBeCalledTimes(1);
    expect(observer.onMetrics).toBeCalledTimes(0);
    expect(observer.onSelection).toBeCalledTimes(0);
  });
  it('onDropZone', function() {
    const state = stageStoreMock.getState();
    stageStoreMock.state = {
      ...stageStoreMock.state,
      selectables: [{
      ...stageStoreMock.selectableElem1,
      isDropZone: false,
      },
      stageStoreMock.selectableElem2,
      ],
    };
    stageStoreMock.dispatch(null);
    expect(observer.onStateChanged).toBeCalledTimes(1);
    expect(observer.onMetrics).toBeCalledTimes(0);
    expect(observer.onSelection).toBeCalledTimes(0);
  });
});
