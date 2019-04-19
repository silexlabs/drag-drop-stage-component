import * as electron from 'electron';
import {Ui} from '../src/ts/Ui';
import { StageStoreMock } from './flux/StageStoreMock';

describe('Ui', () => {

  var ui: Ui;
  var iframeTest: HTMLIFrameElement;
  var stageStoreMock: StageStoreMock;
  var iframeUi: HTMLIFrameElement;

  function resetUi() {
    iframeTest = document.querySelector('#iframe-test-id');
    ui = new Ui(iframeTest, stageStoreMock);
    jest.spyOn(ui, 'update');

    const iframes = Array.from(document.querySelectorAll('iframe'));
    iframeUi = iframes.find(i => i.id != 'iframe-test-id');
  }

  function addSelectable() {
    stageStoreMock.state = {
      ...stageStoreMock.state,
      selectables: [
        ...stageStoreMock.state.selectables,
        {
          el: null,
          selectable: true,
          selected: false,
          draggable: true,
          resizeable: true,
          isDropZone: true,
          useMinHeight: true,
          metrics: {
            position: 'static',
            proportions: 1,
            margin: {top: 0, left: 0, bottom: 0, right: 0 },
            padding: {top: 0, left: 0, bottom: 0, right: 0 },
            border: {top: 0, left: 0, bottom: 0, right: 0 },
            computedStyleRect: {top: 10000, left: 10000, bottom: 20000, right: 20000, width: 10000, height: 10000 },
            clientRect: {top: 10000, left: 10000, bottom: 20000, right: 20000, width: 10000, height: 10000 },
          },
        },
      ]
    };
    stageStoreMock.dispatch(null)
  }

  beforeEach((done) => {
    // DOM
    document.body.innerHTML = `
      <style>
        #iframe-test-id {
          position: relative;
          width: 1000px;
          height: 1000px;
          margin: 100px;
        }
      </style>
      <iframe id="iframe-test-id" />
    `;

    // Store mock
    stageStoreMock = new StageStoreMock()
    jest.spyOn(stageStoreMock, 'subscribe');
    jest.spyOn(stageStoreMock, 'dispatch');
    jest.spyOn(stageStoreMock, 'getState');

    resetUi();

    // const timeout = 10000;
    // jest.setTimeout(timeout);
    // electron.remote.getCurrentWindow().show();
    // setTimeout(() => { done() }, timeout);
    // return;
    setTimeout(() => { done() }, 0);
  });


  it('should create an iframe on top of the iframe', () => {
    expect(ui).not.toBeNull();

    const iframes = Array.from(document.querySelectorAll('iframe'));
    expect(iframes.length).toBe(2);

    expect(iframeUi).not.toBeNull();
    expect(iframeUi.getBoundingClientRect()).toMatchObject(iframeTest.getBoundingClientRect());
    expect(parseInt(window.getComputedStyle(iframeUi).zIndex)).toBe(1);
    expect(window.getComputedStyle(iframeUi).backgroundColor).toBe('rgba(0, 0, 0, 0)');

    window.dispatchEvent(new Event('resize'));
    expect(ui.update).toBeCalledTimes(1);
  });

  it('should listen to the store and update', () => {
    expect(stageStoreMock.subscribe).toBeCalledTimes(2);
    addSelectable();
    expect(ui.update).toBeCalledTimes(1);
  });

  it('should draw the UI', () => {
    var elements = Array.from(iframeUi.contentDocument.body.querySelectorAll('.box'));
    expect(elements.length).toBe(2);
    elements.forEach((el, idx) => expect(el).toMatchSnapshot('snapshot-draw-ui' + idx));

    addSelectable();

    var elements = Array.from(iframeUi.contentDocument.body.querySelectorAll('.box'));
    expect(elements.length).toBe(3);
    elements.forEach((el, idx) => expect(el).toMatchSnapshot('snapshot-draw-ui' + idx));
  });

  it('should change the mouse cursor', () => {
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
    stageStoreMock.dispatch(null, null, 1);
    expect(iframeUi.contentDocument.body.style.cursor).toBe('alias');
  });
});