import * as DomMetrics from '../src/ts/utils/DomMetrics';
import * as electron from 'electron';

describe('DomMetrics', function() {
  var elem1;
  var elem2;
  var elem3;
  var elem4;

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
      <div class="abs" id="elem1"></div>
      <div class="abs" id="elem2"></div>
      <div class="" id="elem3"></div>
      <div class="abs" id="elem4"></div>
    `;

    elem1 = document.querySelector('#elem1');
    elem2 = document.querySelector('#elem2');
    elem3 = document.querySelector('#elem3');
    elem4 = document.querySelector('#elem4');

    window.scroll(0, 0);
  });

  it('getWindow', function() {
    const win = DomMetrics.getWindow(document);
    expect(win).toBe(window);
  });

  it('getDocument', function() {
    const doc = DomMetrics.getDocument(elem1);
    expect(doc).toBe(document);
  });

  it('getMetrics for absolute element without margin/padding/border', function() {
    const metrics = DomMetrics.getMetrics(elem1);
    expect(metrics.position).toBe('absolute');
    expect(metrics.computedStyleRect).toMatchObject({"width":"10px","height":"10px","left":"100px","top":"100px"});
    expect(metrics.border).toMatchObject({"left":0,"top":0,"right":0,"bottom":0});
    expect(metrics.padding).toMatchObject({"left":0,"top":0,"right":0,"bottom":0});
    expect(metrics.margin).toMatchObject({"left":0,"top":0,"right":0,"bottom":0});
    expect(metrics.clientRect).toMatchObject({"top":100,"left":100,"bottom":110,"right":110,"width":10,"height":10});
  });

  it('getMetrics for absolute element with margin/padding/border', function() {
    const metrics = DomMetrics.getMetrics(elem4);
    expect(metrics.position).toBe('absolute');
    expect(metrics.computedStyleRect).toMatchObject({"width":"10px","height":"10px","left":"500px","top":"15000px"});
    expect(metrics.border).toMatchObject({"left":30,"top":30,"right":30,"bottom":30});
    expect(metrics.padding).toMatchObject({"left":20,"top":20,"right":20,"bottom":20});
    expect(metrics.margin).toMatchObject({"left":10,"top":10,"right":10,"bottom":10});
    expect(metrics.clientRect).toMatchObject({"top":15010,"left":510,"bottom":15120,"right":620,"width":110,"height":110});
  });

  it('getMetrics for an element in the flow with margin/padding/border', function() {
    const metrics = DomMetrics.getMetrics(elem3);
    expect(metrics.position).toBe("static");
    expect(metrics.computedStyleRect).toMatchObject({"width":"10px","height":"10px","left": "auto","top": "auto"});
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
    DomMetrics.setMetrics(elem1, metrics);
    expect(elem1.style.position).toBe("");
    expect({"width": elem1.style.width,"height": elem1.style.height,"left": elem1.style.left,"top": elem1.style.top}).toMatchObject({"width": "30px", "height": "999px", "left": "", "top": ""});
    expect({"left": elem1.style.borderLeft,"top": elem1.style.borderTop,"right": elem1.style.borderRight,"bottom": elem1.style.borderBottom}).toMatchObject({"left": "30px","top": "30px","right": "30px","bottom": "30px"});
    expect({"left": elem1.style.paddingLeft,"top": elem1.style.paddingTop,"right": elem1.style.paddingRight,"bottom": elem1.style.paddingBottom}).toMatchObject({"left": "20px","top": "20px","right": "20px","bottom": "20px"});
    expect({"left": elem1.style.marginLeft,"top": elem1.style.marginTop,"right": elem1.style.marginRight,"bottom": elem1.style.marginBottom}).toMatchObject({"left": "1000px","top": "1000px","right": "1000px","bottom": "1000px"});
  });

  it('fromClientToComputed', function() {
    const metrics1 = {
      position: "static",
      computedStyleRect: {"width": "0px","height": "0px","left": "auto","top": "auto"},
      border: {"left": 30,"top": 30,"right": 30,"bottom": 30},
      padding: {"left": 20,"top": 20,"right": 20,"bottom": 20},
      margin: {"left": 1000,"top": 1000,"right": 1000,"bottom": 1000},
      clientRect: {"top": 1000,"left": 1000,"bottom": 1100,"right": 1100,"width": 100,"height": 100}
    };
    const metrics2 = JSON.parse(JSON.stringify(metrics1));
    metrics2.computedStyleRect = {"width": "0px","height": "0px","left": "auto","top": "auto"};
    const resultMetrics = DomMetrics.fromClientToComputed(metrics2);
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
    const style = window.getComputedStyle(elem2);
    expect(style.getPropertyValue('top')).toBe('500px');

    expect(window.scrollY).toBe(0);
    expect(window.scrollX).toBe(0);
    expect(window.document.body.scrollHeight).toBe(30000);

    // element is already visible
    var bb = elem2.getBoundingClientRect();
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
