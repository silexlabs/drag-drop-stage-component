import * as types from '../../src/ts/Types';
import {UiObserver} from '../../src/ts/observers/UiObserver';
import {StageStoreMock, hooks} from '../flux/StageStoreMock';
import { DrawHandler } from '../../src/ts/handlers/DrawHandler';

describe('UiObserver', function() {
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
      <div class="elem i-am-selectable" id="elem1">
        <div class="elem i-am-selectable" id="elem2">
        </div>
      </div>
    `;

    StageStoreMock.elem1 = document.querySelector('#elem1');
    StageStoreMock.elem2 = document.querySelector('#elem2');

    stageStoreMock = new StageStoreMock()
    jest.spyOn(stageStoreMock, 'subscribe');
    jest.spyOn(stageStoreMock, 'dispatch');
    jest.spyOn(stageStoreMock, 'getState');

    observer = new UiObserver(document, document, stageStoreMock, hooks);
    jest.spyOn(observer, 'onUiStateChanged');
  });

  it('init', function() {
    expect(stageStoreMock.subscribe).toHaveBeenCalledTimes(1);
    expect(stageStoreMock.getState().ui.mode).toBe(types.UiMode.NONE);
  });

  it('onUiStateChanged UiMode', function() {
    expect(observer.handler).toBeNull();

    stageStoreMock.state = {
      ...stageStoreMock.state,
      ui: {
        mode: types.UiMode.DRAW,
        catchingEvents: true,
        refreshing: false,
        sticky: types.EMPTY_STICKY_BOX(),
        enableSticky: false,
      }
    };
    stageStoreMock.dispatch(null);
    expect(observer.onUiStateChanged).toBeCalledTimes(1);
    expect(observer.handler).not.toBeNull();
    expect(observer.handler).toBeInstanceOf(DrawHandler);

    stageStoreMock.initialState = {
      ...stageStoreMock.state,
      ui: {
        mode: types.UiMode.DRAW,
        catchingEvents: true,
        refreshing: false,
        sticky: types.EMPTY_STICKY_BOX(),
        enableSticky: false,
      }
    };
    stageStoreMock.state = {
      ...stageStoreMock.state,
      ui: {
        mode: types.UiMode.NONE,
        catchingEvents: true,
        refreshing: false,
        sticky: types.EMPTY_STICKY_BOX(),
        enableSticky: false,
      }
    };
    stageStoreMock.dispatch(null);
    expect(observer.onUiStateChanged).toBeCalledTimes(2);
    expect(observer.handler).toBeNull();
  });

  it('onUiStateChanged scrollData', function() {
    stageStoreMock.state = {
      ...stageStoreMock.state,
      ui: {
        mode: types.UiMode.DRAW,
        catchingEvents: true,
        refreshing: false,
        sticky: types.EMPTY_STICKY_BOX(),
        enableSticky: false,
      }
    };
    stageStoreMock.state = {
      ...stageStoreMock.state,
      mouse: {
        ...stageStoreMock.state.mouse,
        scrollData: {x: 0, y: 100},
      }
    };
    stageStoreMock.dispatch(null);
    expect(observer.onUiStateChanged).toBeCalledTimes(1);
  });

});
