import {StageStoreMock, hooks} from '../flux/StageStoreMock';
import {
  domObservers,
  initDomObservers,
  addDomObserver,
  removeDomObserver,
  DomObserver,
} from '../../src/ts/observers/DomObserver';

var stageStoreMock: StageStoreMock;
var observer: DomObserver;
beforeEach(() => {
  const fn = jest.fn();
  initDomObservers([], fn)

  stageStoreMock = new StageStoreMock()

  observer = new DomObserver(stageStoreMock, (state) => {});
  jest.spyOn(observer, 'onAdded');
  jest.spyOn(observer, 'onRemoved');

})

it('initDomObservers', () => {
  expect(domObservers).toEqual(new Map());

  const el1 = document.createElement('div');
  const el2 = document.createElement('div');
  initDomObservers([el1, el2], () => {})
  expect(Array.from(domObservers)).toHaveLength(2);

  initDomObservers([], () => {})
  expect(domObservers).toEqual(new Map());
})

it('addDomObserver and removeDomObserver', () => {
  const el1 = document.createElement('div');
  const el2 = document.createElement('div');
  addDomObserver(el1, () => {});
  expect(Array.from(domObservers)).toHaveLength(1);
  addDomObserver(el2, () => {});
  expect(Array.from(domObservers)).toHaveLength(2);
  addDomObserver(el2, () => {});
  expect(Array.from(domObservers)).toHaveLength(2);
  removeDomObserver(el1);
  expect(Array.from(domObservers)).toHaveLength(1);
  removeDomObserver(el2);
  expect(Array.from(domObservers)).toHaveLength(0);
  expect(() => removeDomObserver(el1)).toThrow();
})

it('onAdded and onRemoved should not be called on change', function() {
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
  expect(observer.onAdded).toBeCalledTimes(0);
  expect(observer.onRemoved).toBeCalledTimes(0);

});

it('onRemoved', function() {
  stageStoreMock.state = {
    ...stageStoreMock.state,
    selectables: [],
  }
  initDomObservers(stageStoreMock.state.selectables.map((s) => s.el), () => {})
  expect(() => stageStoreMock.dispatch(null)).toThrow();
  expect(observer.onAdded).toBeCalledTimes(0);
  expect(observer.onRemoved).toBeCalledTimes(1);

});

it('onAdded', function() {
  const newDomEl = document.createElement('div');
  document.body.appendChild(newDomEl);
  stageStoreMock.state = {
    ...stageStoreMock.state,
    selectables: [
      ...stageStoreMock.state.selectables,
      {
        ...stageStoreMock.selectableElem2,
        id: 'elemAdded',
        el: newDomEl,
      },
    ],
  };
  stageStoreMock.dispatch(null);
  expect(observer.onRemoved).toBeCalledTimes(0);
  expect(observer.onAdded).toBeCalledTimes(1);
});


