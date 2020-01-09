import {StageStore} from '../../src/ts/flux/StageStore';
import { createSelectable } from '../../src/ts/flux/SelectableState';

describe('StageStore', function() {
  let instance: StageStore;
  beforeAll(() => {
    document.body.innerHTML = `
      <div class="i-am-selectable"></div>
      <div class="i-am-NOT-selectable"></div>
      <div class="i-am-selectable"></div>
    `;
    instance = new StageStore();
    Array.from(document.querySelectorAll('.i-am-selectable'))
    .forEach((el: HTMLElement) => {
      instance.dispatch(
        createSelectable({
          el,
          id: 'elemXID',
          selectable: true,
          selected: false,
          draggable: true,
          resizeable: {
            top: true,
            left: true,
            bottom: true,
            right: true,
          },
          isDropZone: true,
          useMinHeight: true,
          metrics: {
            position: 'absolute',
            proportions: 1,
            margin: {top: 0, left: 0, bottom: 0, right: 0 },
            padding: {top: 0, left: 0, bottom: 0, right: 0 },
            border: {top: 0, left: 0, bottom: 0, right: 0 },
            computedStyleRect: {top: 100, left: 100, bottom: 200, right: 200, width: 100, height: 100 },
            clientRect: {top: 100, left: 100, bottom: 200, right: 200, width: 100, height: 100 },
          }
        })
      );
    });
  });

  it('createStore to create a store with the DOM as selectables', () => {
    expect(instance).not.toBeNull();
    expect(instance.getState()).not.toBeNull();
    expect(instance.getState().selectables).not.toBeNull();
    expect(instance.getState().selectables.length).toBe(2);
    expect(instance.getState().selectables[0].draggable).toBe(true);
  });
  it('dispatch and subscribe', (done) => {
    let changeCount = 0;
    const unsubscribe = instance.subscribe((current, prev) => {
      changeCount++;
    });
    let mouseChangeCount = 0;
    const mouseUnsubscribe = instance.subscribe((current, prev) => {
      mouseChangeCount++;
    }, state => state.mouse);
    let selectablesChangeCount = 0;
    const selectablesUnsubscribe = instance.subscribe((current, prev) => {
      selectablesChangeCount++;
    }, state => state.selectables);
    let uiChangeCount = 0;
    const uiUnsubscribe = instance.subscribe((current, prev) => {
      uiChangeCount++;
    }, state => state.ui);

    instance.dispatch({
      type: 'UI_SET_MODE',
      mode: instance.getState().ui.mode,
    });
    instance.dispatch({
      type: 'SELECTABLE_UPDATE',
      selectables: instance.getState().selectables
    });
    setTimeout(() => {
      expect(changeCount).toBe(2);
      expect(mouseChangeCount).toBe(0);
      expect(selectablesChangeCount).toBe(1);
      expect(uiChangeCount).toBe(1);
      done();
    }, 0);
  });
});
