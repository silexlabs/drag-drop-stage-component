import {ResizeHandler} from '../../src/ts/handlers/ResizeHandler';
import { hooks, StageStoreMock } from '../flux/StageStoreMock';

describe('ResizeHandler', function() {

  var elem3;
  var stageStoreMock: StageStoreMock;

  beforeEach(function () {
    document.body.innerHTML = `
      <div class="selectable" id="elem1"></div>
      <div class="selectable" id="elem2"></div>
      <div class="selectable" id="elem3"></div>
    `;

    StageStoreMock.elem1 = document.querySelector('#elem1');
    StageStoreMock.elem2 = document.querySelector('#elem2');
    elem3 = document.querySelector('#elem3');

    stageStoreMock = new StageStoreMock();
    stageStoreMock.preventDispatch = true;
    jest.spyOn(stageStoreMock, 'subscribe');
    jest.spyOn(stageStoreMock, 'dispatch');
    jest.spyOn(stageStoreMock, 'getState');
  });

  it('should resize 1 element from the bottom right corner', function() {
    stageStoreMock.selectableElem2.selected = true;

    var handler = new ResizeHandler(document, stageStoreMock, hooks);
    jest.spyOn(handler, 'update');
    jest.spyOn(handler, 'release');

    var mouseData = {
      mouseX: 15,
      movementX: 1,
      mouseY: 15,
      movementY: 1,
      shiftKey: false,
      target: document.body,
    };
    stageStoreMock.mouseState.mouseData = mouseData;
    handler.update(mouseData);
    expect(stageStoreMock.dispatch).toBeCalledTimes(1);
    var calls = stageStoreMock.dispatch['mock'].calls;
    var lastAction = calls[calls.length - 1][0];
    expect(lastAction.type).toBe('SELECTABLE_UPDATE');
    expect(lastAction.selectables.length).toBe(1);
    expect(lastAction.selectables[0].el).toBe(StageStoreMock.elem2);

    handler.release();
  });

  // it('should resize 2 elements from the bottom right corner', function() {
  //   var handler = new ResizeHandler([elem1, elem2], document, {
  //     keepProportions: false,
  //     useMinHeightHook: el => true,
  //     direction: {x: 'right', y: 'bottom'},
  //   });

  //   handler.update(0, 10, 10, 20);
  //   assert.equal(elem1.style.width, '10px', `The element should have a width '10px' instead of '${elem1.style.width}'`)
  //   assert.equal(elem1.style.minHeight, '20px', `The element should have a height of '20px' instead of '${elem1.style.minHeight}'`)
  //   assert.equal(elem2.style.width, '10px', `The element should have a width '10px' instead of '${elem2.style.width}'`)
  //   assert.equal(elem2.style.minHeight, '20px', `The element should have a height of '20px' instead of '${elem2.style.minHeight}'`)

  //   handler.release();
  // });

  // it('should resize 1 element from the top left corner', function() {
  //   var handler = new ResizeHandler([elem1], document, {
  //     useMinHeightHook: el => true,
  //     direction: {x: 'left', y: 'top'},
  //   });

  //   handler.update(0, -10, 10, 0, false);
  //   assert.equal(elem1.style.width, '10px', `The element should have a width '10px' instead of '${elem1.style.width}'`)
  //   assert.equal(elem1.style.minHeight, '20px', `The element should have a height of '20px' instead of '${elem1.style.minHeight}'`)
  //   assert.equal(elem1.style.top, '-10px', `The element should have top '-10px' instead of '${elem1.style.top}'`)
  //   assert.equal(elem1.style.left, '0px', `The element should have left '0px' instead of '${elem1.style.left}'`)

  //   handler.release();
  // });

  // it('should resize 2 elements from the top left corner', function() {
  //   var handler = new ResizeHandler([elem1, elem2], document, {
  //     useMinHeightHook: el => true,
  //     direction: {x: 'left', y: 'top'},
  //   });

  //   handler.update(0, -10, 10, 0, false);
  //   assert.equal(elem1.style.width, '10px', `The element should have a width '10px' instead of '${elem1.style.width}'`)
  //   assert.equal(elem1.style.minHeight, '20px', `The element should have a height of '20px' instead of '${elem1.style.minHeight}'`)
  //   assert.equal(elem1.style.top, '-10px', `The element should have top '-10px' instead of '${elem1.style.top}'`)
  //   assert.equal(elem1.style.left, '0px', `The element should have left '0px' instead of '${elem1.style.left}'`)
  //   assert.equal(elem2.style.width, '10px', `The element should have a width '10px' instead of '${elem2.style.width}'`)
  //   assert.equal(elem2.style.minHeight, '20px', `The element should have a height of '20px' instead of '${elem2.style.minHeight}'`)

  //   handler.release();
  // });

  // it('should resize 1 element and keep proporitions', function() {
  //   var bb = elem1.getBoundingClientRect();
  //   assert.equal(bb.width, 10, `The element should have an **INITIAL** width '10px' instead of '${bb.width}'`)
  //   assert.equal(bb.height, 10, `The element should have an **INITIAL** height of '10px' instead of '${bb.height}'`)

  //   var handler = new ResizeHandler([elem1], document, {
  //     useMinHeightHook: el => true,
  //     direction: {x: 'right', y: 'bottom'},
  //   });
  //   // move vertical => no size change
  //   handler.update(0, 10, 10, 20, true);
  //   var bb = elem1.getBoundingClientRect();
  //   assert.equal(bb.width, 10, `The element should have a width '10px' instead of '${bb.width}'`)
  //   assert.equal(bb.height, 10, `The element should have a height of '10px' instead of '${bb.height}'`)

  //   // move horizontal => w and h change
  //   handler.update(20, 0, 30, 20, true);
  //   var bb = elem1.getBoundingClientRect();
  //   assert.equal(bb.width, 30, `The element should have a width '30px' instead of '${bb.width}'`)
  //   assert.equal(bb.height, 30, `The element should have a height of '30px' instead of '${bb.height}'`)

  //   handler.release();
  // });

  // it('should try resize to 1 element from the top but can not because of its content', function() {
  //   var handler = new ResizeHandler([elem3], document, {
  //     useMinHeightHook: el => true,
  //     direction: {x: '', y: 'top'},
  //   });

  //   handler.update(0, 5, 10, 25, false);
  //   assert.equal(elem3.style.minHeight, '5px', `The element should have a height of '5px' instead of '${elem3.style.minHeight}'`)
  //   assert.equal(elem3.style.top, '20px', `The element should have top '20px' instead of '${elem3.style.top}'`)

  //   handler.release();
  // });

  // it('should resize to 1 element from the left', function() {
  //   const style = {
  //     width: 100,
  //     left: 100,
  //     borderLeftWidth: 10,
  //     borderRightWidth: 20,
  //     paddingLeft: 30,
  //     paddingRight: 40,
  //     marginLeft: 50,
  //     marginRight: 60,

  //     height: 100,
  //     top: 100,
  //     borderTopWidth: 10,
  //     borderBottomWidth: 20,
  //     paddingTop: 30,
  //     paddingBottom: 40,
  //     marginTop: 50,
  //     marginBottom: 60,
  //   }

  //   elemAbs.style.width = style.width + 'px';
  //   elemAbs.style.left = style.left + 'px';
  //   elemAbs.style.borderLeftWidth = style.borderLeftWidth + 'px';
  //   elemAbs.style.borderRightWidth = style.borderRightWidth + 'px';
  //   elemAbs.style.paddingLeft = style.paddingLeft + 'px'
  //   elemAbs.style.paddingRight = style.paddingRight + 'px'
  //   elemAbs.style.marginLeft = style.marginLeft + 'px'
  //   elemAbs.style.marginRight = style.marginRight + 'px'

  //   elemAbs.style.height = style.height + 'px';
  //   elemAbs.style.top = style.top + 'px';
  //   elemAbs.style.borderTopWidth = style.borderTopWidth + 'px';
  //   elemAbs.style.borderBottomWidth = style.borderBottomWidth + 'px';
  //   elemAbs.style.paddingTop = style.paddingTop + 'px'
  //   elemAbs.style.paddingBottom = style.paddingBottom + 'px'
  //   elemAbs.style.marginTop = style.marginTop + 'px'
  //   elemAbs.style.marginBottom = style.marginBottom + 'px'

  //   var initialClientRect = elemAbs.getBoundingClientRect();
  //   assert.equal(initialClientRect.left, style.left + style.marginLeft, `The element has wrong **INITIAL*** left`)
  //   assert.equal(initialClientRect.width, style.width + style.borderLeftWidth + style.borderRightWidth + style.paddingLeft + style.paddingRight, `The element has wrong **INITIAL*** width`)
  //   assert.equal(initialClientRect.right, style.left + style.width + style.marginLeft + style.paddingLeft + style.paddingRight + style.borderLeftWidth + style.borderRightWidth, `The element has wrong **INITIAL*** right`)

  //   assert.equal(initialClientRect.top, style.top + style.marginTop, `The element has wrong **INITIAL*** top`)
  //   assert.equal(initialClientRect.height, style.height + style.borderTopWidth + style.borderBottomWidth + style.paddingTop + style.paddingBottom, `The element has wrong **INITIAL*** height`)
  //   assert.equal(initialClientRect.bottom, style.top + style.height + style.marginTop + style.paddingTop + style.paddingBottom + style.borderTopWidth + style.borderBottomWidth, `The element has wrong **INITIAL*** bottom`)

  //   var move = {
  //     left: 5,
  //     top: 10,
  //   }

  //   var handler = new ResizeHandler([elemAbs], document, {
  //     useMinHeightHook: el => true,
  //     direction: {x: 'left', y: ''},
  //   });

  //   handler.update(move.left, move.top, style.left + move.left, style.top + move.top, false);

  //   var bb = elemAbs.getBoundingClientRect();
  //   assert.equal(bb.left, initialClientRect.left + move.left, `The element has the wrong left (${bb.left}, ${initialClientRect.left}, ${move.left})`)
  //   assert.equal(bb.width, initialClientRect.width - move.left, `The element has the wrong width`)
  //   assert.equal(bb.right, initialClientRect.right, `The element has the wrong right`)

  //   assert.equal(bb.top, initialClientRect.top, `The element has the wrong top`)
  //   assert.equal(bb.height, initialClientRect.height, `The element has the wrong height`)
  //   assert.equal(bb.bottom, initialClientRect.bottom, `The element has the wrong bottom`)

  //   handler.release();
  // });

  // // not sure that this works as expected
  // it('should resize 1 element from the top but not move it when the window is scrolled', function() {
  //   elemAbs.minHeight = '100000px'
  //   elemAbs.style.top = '1000px';
  //   document.defaultView.scroll(0, 1000);

  //   var bb = elemAbs.getBoundingClientRect();
  //   assert.equal(bb.width, 10, `The element should have an **INITIAL** width '10px' instead of '${bb.width}'`)
  //   assert.equal(bb.height, 10, `The element should have an **INITIAL** height of '10px' instead of '${bb.height}'`)
  //   assert.equal(bb.top, 290, `The element should have an **INITIAL** top '10px' instead of '${bb.top}'`)

  //   var handler = new ResizeHandler([elemAbs], document, {
  //     useMinHeightHook: el => true,
  //     direction: {x: '', y: 'top'},
  //   });

  //   handler.update(0, -5, 10, 995, false);
  //   var bb = elemAbs.getBoundingClientRect();
  //   console.log(bb)
  //   assert.equal(bb.height, 15, `The element should have a height of '15px' instead of '${bb.height}'`)
  //   assert.equal(bb.top, 285, `The element should have top '285px' instead of '${bb.top}'`)

  //   handler.release();
  // });
});
