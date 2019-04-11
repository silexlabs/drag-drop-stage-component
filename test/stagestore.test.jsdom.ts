// import * as redux from 'redux';
import {StageStore} from '../src/ts/flux/StageStore';

describe('StageStore', function() {
  let instance;
  beforeAll(() => {
    document.body.innerHTML = `
      <div class="i-am-selectable"></div>
      <div class="i-am-NOT-selectable"></div>
      <div class="i-am-selectable"></div>
    `;
    instance = new StageStore();
    StageStore.selectablesFromDom(document, {
      isSelectableHook: (el => el.classList.contains('i-am-selectable')),
      isDraggableHook: (el => true),
      isDropZoneHook: (el => true),
      isResizeableHook: (el => true),
    }).forEach(selectable => {
      instance.dispatch({
        type: 'SELECTABLE_CREATE',
        selectable,
      })
    })
  })
  it('createStore to create a store with the DOM as selectables', () => {
    expect(instance).not.toBeNull();
    expect(instance.getState()).not.toBeNull();
    expect(instance.getState().selectables).not.toBeNull();
    expect(instance.getState().selectables.length).toBe(2);
    expect(instance.getState().selectables[0].draggable).toBe(true);
  });
  it('dispatch and subscribe', () => {
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
      type: 'SELECTABLE_UPDATE',
      selectables: instance.getState().selectables,
    });
    expect(changeCount).toBe(1);
    expect(mouseChangeCount).toBe(0);
    expect(selectablesChangeCount).toBe(1);
    expect(uiChangeCount).toBe(0);
  });
});
