import * as DomMetrics from '../../src/ts/utils/DomMetrics';
import * as electron from 'electron';
import { StageStoreMock } from '../flux/StageStoreMock';

describe('DomMetrics', function() {
  var elem3;
  var elem4;
  var elem5;
  var stageStoreMock: StageStoreMock;

  beforeEach(function () {
    document.head.innerHTML = `
    <style>
      * {
        margin: 0;
        padding: 0;
        border: 0;
        width: 10px;
        height: 10px;
      }
      body {
        min-height: 30000px;
      }
      .abs {
        position: absolute;
        background: blue;
      }
      #elem1 {
        top: 100px;
        left: 100px;
      }
      #elem2 {
        top: 500px;
        left: 500px;
      }
      #elem3 {
        margin: 1000px;
        padding: 20px;
        border: 30px solid;
      }
      #elem4 {
        margin: 10px;
        padding: 20px;
        border: 30px solid;
        top: 15000px;
        left: 500px;
      }
    </style>
    `;

    document.body.innerHTML = `
      <div class="abs" id="elem1">
        <div class="abs" id="elem5"></div>
      </div>
      <div class="abs" id="elem2"></div>
      <div class="" id="elem3"></div>
      <div class="abs" id="elem4"></div>
    `;

    StageStoreMock.elem1 = document.querySelector('#elem1');
    StageStoreMock.elem2 = document.querySelector('#elem2');
    elem3 = document.querySelector('#elem3');
    elem4 = document.querySelector('#elem4');
    elem5 = document.querySelector('#elem5');

    stageStoreMock = new StageStoreMock();
    jest.spyOn(stageStoreMock, 'subscribe');
    jest.spyOn(stageStoreMock, 'dispatch');
    jest.spyOn(stageStoreMock, 'getState');

    window.scroll(0, 0);
  });

  it('getWindow', function() {
    const win = DomMetrics.getWindow(document);
    expect(win).toBe(window);
  });

  it('getDocument', function() {
    const doc = DomMetrics.getDocument(StageStoreMock.elem1);
    expect(doc).toBe(document);
  });

  it('getMetrics for absolute element without margin/padding/border', function() {
    const metrics = DomMetrics.getMetrics(StageStoreMock.elem1);
    expect(metrics.position).toBe('absolute');
    expect(metrics.computedStyleRect).toMatchObject({"width":10,"height":10,"left":100,"top":100});
    expect(metrics.border).toMatchObject({"left":0,"top":0,"right":0,"bottom":0});
    expect(metrics.padding).toMatchObject({"left":0,"top":0,"right":0,"bottom":0});
    expect(metrics.margin).toMatchObject({"left":0,"top":0,"right":0,"bottom":0});
    expect(metrics.clientRect).toMatchObject({"top":100,"left":100,"bottom":110,"right":110,"width":10,"height":10});
    expect(metrics.proportions).toBe(1);
  });

  it('getMetrics for absolute element with margin/padding/border', function() {
    const metrics = DomMetrics.getMetrics(elem4);
    expect(metrics.position).toBe('absolute');
    expect(metrics.computedStyleRect).toMatchObject({"width":10,"height":10,"left":500,"top":15000});
    expect(metrics.border).toMatchObject({"left":30,"top":30,"right":30,"bottom":30});
    expect(metrics.padding).toMatchObject({"left":20,"top":20,"right":20,"bottom":20});
    expect(metrics.margin).toMatchObject({"left":10,"top":10,"right":10,"bottom":10});
    expect(metrics.clientRect).toMatchObject({"top":15010,"left":510,"bottom":15120,"right":620,"width":110,"height":110});
  });

  it('getMetrics for an element in the flow with margin/padding/border', function() {
    const metrics = DomMetrics.getMetrics(elem3);
    expect(metrics.position).toBe("static");
    expect(metrics.computedStyleRect).toMatchObject({"width":10,"height":10,"left": 0,"top": 0});
    expect(metrics.border).toMatchObject({"left": 30,"top": 30,"right": 30,"bottom": 30});
    expect(metrics.padding).toMatchObject({"left": 20,"top": 20,"right": 20,"bottom": 20});
    expect(metrics.margin).toMatchObject({"left": 1000,"top": 1000,"right": 1000,"bottom": 1000});
    expect(metrics.clientRect).toMatchObject({"top": 1000,"left": 1000,"bottom": 1110,"right": 1110,"width": 110,"height": 110});
  });

  it('setMetrics for an element in the flow with margin/padding/border', function() {
    const metrics = {
      position: "absolute",
      computedStyleRect: {"width": 30, "height": 999, "left": 0, "top": 0},
      border: {"left": 30,"top": 30,"right": 30,"bottom": 30},
      padding: {"left": 20,"top": 20,"right": 20,"bottom": 20},
      margin: {"left": 1000,"top": 1000,"right": 1000,"bottom": 1000},
      clientRect: {"top": 1000,"left": 1000,"bottom": 1110,"right": 1110,"width": 110,"height": 110},
    }
    DomMetrics.setMetrics(StageStoreMock.elem1, false, metrics);
    expect(StageStoreMock.elem1.style.position).toBe("");
    expect({"width": StageStoreMock.elem1.style.width,"height": StageStoreMock.elem1.style.height,"left": StageStoreMock.elem1.style.left,"top": StageStoreMock.elem1.style.top}).toMatchObject({"width": "30px", "height": "999px", "left": "", "top": ""});
    expect({"left": StageStoreMock.elem1.style.borderLeftWidth,"top": StageStoreMock.elem1.style.borderTopWidth,"right": StageStoreMock.elem1.style.borderRightWidth,"bottom": StageStoreMock.elem1.style.borderBottomWidth}).toMatchObject({"left": "30px","top": "30px","right": "30px","bottom": "30px"});
    expect({"left": StageStoreMock.elem1.style.paddingLeft,"top": StageStoreMock.elem1.style.paddingTop,"right": StageStoreMock.elem1.style.paddingRight,"bottom": StageStoreMock.elem1.style.paddingBottom}).toMatchObject({"left": "20px","top": "20px","right": "20px","bottom": "20px"});
    expect({"left": StageStoreMock.elem1.style.marginLeft,"top": StageStoreMock.elem1.style.marginTop,"right": StageStoreMock.elem1.style.marginRight,"bottom": StageStoreMock.elem1.style.marginBottom}).toMatchObject({"left": "1000px","top": "1000px","right": "1000px","bottom": "1000px"});

    DomMetrics.setMetrics(StageStoreMock.elem1, true, metrics);
    expect(StageStoreMock.elem1.style.position).toBe("");
    expect({"width": StageStoreMock.elem1.style.width,"height": StageStoreMock.elem1.style.minHeight,"left": StageStoreMock.elem1.style.left,"top": StageStoreMock.elem1.style.top}).toMatchObject({"width": "30px", "height": "999px", "left": "", "top": ""});
    expect({"left": StageStoreMock.elem1.style.borderLeftWidth,"top": StageStoreMock.elem1.style.borderTopWidth,"right": StageStoreMock.elem1.style.borderRightWidth,"bottom": StageStoreMock.elem1.style.borderBottomWidth}).toMatchObject({"left": "30px","top": "30px","right": "30px","bottom": "30px"});
    expect({"left": StageStoreMock.elem1.style.paddingLeft,"top": StageStoreMock.elem1.style.paddingTop,"right": StageStoreMock.elem1.style.paddingRight,"bottom": StageStoreMock.elem1.style.paddingBottom}).toMatchObject({"left": "20px","top": "20px","right": "20px","bottom": "20px"});
    expect({"left": StageStoreMock.elem1.style.marginLeft,"top": StageStoreMock.elem1.style.marginTop,"right": StageStoreMock.elem1.style.marginRight,"bottom": StageStoreMock.elem1.style.marginBottom}).toMatchObject({"left": "1000px","top": "1000px","right": "1000px","bottom": "1000px"});
  });

  // it('fromClientToComputed', function() {
  //   const metrics1 = {
  //     position: "static",
  //     computedStyleRect: {"width": "0px","height": "0px","left": "auto","top": "auto"},
  //     border: {"left": 30,"top": 30,"right": 30,"bottom": 30},
  //     padding: {"left": 20,"top": 20,"right": 20,"bottom": 20},
  //     margin: {"left": 1000,"top": 1000,"right": 1000,"bottom": 1000},
  //     clientRect: {"top": 1000,"left": 1000,"bottom": 1100,"right": 1100,"width": 100,"height": 100}
  //   };
  //   const metrics2 = JSON.parse(JSON.stringify(metrics1));
  //   metrics2.computedStyleRect = {"width": "0px","height": "0px","left": "auto","top": "auto"};
  //   const resultMetrics = DomMetrics.fromClientToComputed(metrics2);
  // });

  it('getSelectable', function() {
    const selectable1 = DomMetrics.getSelectable(stageStoreMock, StageStoreMock.elem1);
    expect(selectable1).not.toBeNull();
    expect(selectable1.el).toBe(StageStoreMock.elem1);

    const selectable3 = DomMetrics.getSelectable(stageStoreMock, elem5);
    expect(selectable3).not.toBeNull();
    expect(selectable3.el).toBe(StageStoreMock.elem1);
  });

  it('hasASelectedDraggableParent', function() {
    stageStoreMock.selectableElem1.selected = true;
    const result1 = DomMetrics.hasASelectedDraggableParent(stageStoreMock, StageStoreMock.elem1);
    expect(result1).toBe(false);

    const result2 = DomMetrics.hasASelectedDraggableParent(stageStoreMock, elem4);
    expect(result2).toBe(false);

    const result3 = DomMetrics.hasASelectedDraggableParent(stageStoreMock, elem5);
    expect(result3).toBe(true);
  });

  it('cursors', function() {
    var direction = DomMetrics.getDirection(100, 100, { x: 0, y: 0 }, stageStoreMock.selectableElem1);
    expect(direction).toMatchObject({x: 'left', y: 'top'})
    var direction = DomMetrics.getDirection(100, 200, { x: 0, y: 0 }, stageStoreMock.selectableElem1);
    expect(direction).toMatchObject({x: 'left', y: 'bottom'})
    var direction = DomMetrics.getDirection(150, 150, { x: 0, y: 0 }, stageStoreMock.selectableElem1);
    expect(direction).toMatchObject({x: '', y: ''})

    var direction = DomMetrics.getDirection(100, 1, { x: 0, y: 99 }, stageStoreMock.selectableElem1);
    expect(direction).toMatchObject({x: 'left', y: 'top'})
    var direction = DomMetrics.getDirection(100, 51, { x: 0, y: 99 }, stageStoreMock.selectableElem1);
    expect(direction).toMatchObject({x: 'left', y: ''})
    var direction = DomMetrics.getDirection(100, 101, { x: 0, y: 99 }, stageStoreMock.selectableElem1);
    expect(direction).toMatchObject({x: 'left', y: 'bottom'})
  });

  it('get/setScroll', function() {
    // check initial state
    expect(window.scrollY).toBe(0);
    expect(window.scrollX).toBe(0);

    // get scroll
    expect(DomMetrics.getScroll(document).x).toBe(0);
    expect(DomMetrics.getScroll(document).y).toBe(0);

    // scroll to
    DomMetrics.setScroll(document, {x: '10', y:10});
    expect(window.scrollY).toBe(10);
    expect(window.scrollX).toBe(10);
    expect(DomMetrics.getScroll(document).x).toBe(10);
    expect(DomMetrics.getScroll(document).y).toBe(10);
  });

  it('getScrollToShow a zone', function() {
    // check initial state
    const style = window.getComputedStyle(StageStoreMock.elem2);
    expect(style.getPropertyValue('top')).toBe('500px');

    expect(window.scrollY).toBe(0);
    expect(window.scrollX).toBe(0);
    expect(window.document.body.scrollHeight).toBe(30000);

    // element is already visible
    var bb = StageStoreMock.elem2.getBoundingClientRect();
    var scroll = DomMetrics.getScrollToShow(document, bb);
    expect(scroll.y).toBe(0);
    expect(scroll.x).toBe(0);


    // element not yet visible
    var bb = elem4.getBoundingClientRect();
    var scroll = DomMetrics.getScrollToShow(document, bb);
    // element position - size - SCROLL_ZONE_SIZE
    expect(scroll.x).toBe(0);
    expect(scroll.y).toBe(14595);
  });
})
