require("babel-polyfill");
var assert = require('assert');

import * as Polyfill from '../src/js/utils/Polyfill';
Polyfill.patchWindow(window);

import * as DomMetrics from '../src/js/utils/DomMetrics';

describe('DomMetrics', function() {
  var elem1;
  var elem2;
  var elem3;
  var elem4;

  beforeEach(function () {
    document.head.innerHTML = `<style>
      * {
        margin: 0;
        padding: 0;
        border: 0;
        width: 10px;
        height: 10px;
      }
      body {
        min-height: 10000px;
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
        top: 500px;
        left: 500px;
      }
    </style>`;

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
    assert.equal(win, window, `Could not retrieve the window out of the doc`);
  });

  it('getDocument', function() {
    const doc = DomMetrics.getDocument(elem1);
    assert.equal(doc, document, `Could not retrieve the document out of the element`);
  });

  it('getMetrics for absolute element without margin/padding/border', function() {
    const metrics = DomMetrics.getMetrics(elem1);
    assert.equal(metrics.position, 'absolute', `Element position should be absolute`);
    assert.deepEqual(metrics.computedStyleRect, {"width":"10px","height":"10px","left":"100px","top":"100px"}, `computedStyleRect is wrong`);
    assert.deepEqual(metrics.border, {"left":0,"top":0,"right":0,"bottom":0}, `border is wrong`);
    assert.deepEqual(metrics.padding, {"left":0,"top":0,"right":0,"bottom":0}, `padding is wrong`);
    assert.deepEqual(metrics.margin, {"left":0,"top":0,"right":0,"bottom":0}, `margin is wrong`);
    assert.deepEqual(metrics.clientRect, {"top":100,"left":100,"bottom":110,"right":110,"width":10,"height":10}, `clientRect is wrong`);
  });

  it('getMetrics for absolute element with margin/padding/border', function() {
    const metrics = DomMetrics.getMetrics(elem4);
    assert.equal(metrics.position, 'absolute', `Element position should be absolute`);
    assert.deepEqual(metrics.computedStyleRect, {"width":"10px","height":"10px","left":"500px","top":"500px"}, `computedStyleRect is wrong`);
    assert.deepEqual(metrics.border, {"left":30,"top":30,"right":30,"bottom":30}, `border is wrong`);
    assert.deepEqual(metrics.padding, {"left":20,"top":20,"right":20,"bottom":20}, `padding is wrong`);
    assert.deepEqual(metrics.margin, {"left":10,"top":10,"right":10,"bottom":10}, `margin is wrong`);
    assert.deepEqual(metrics.clientRect, {"top":510,"left":510,"bottom":620,"right":620,"width":110,"height":110}, `clientRect is wrong`);
  });

  it('getMetrics for an element in the flow with margin/padding/border', function() {
    const metrics = DomMetrics.getMetrics(elem3);
    assert.equal(metrics.position, "static", `position is wrong`);
    assert.deepEqual(metrics.computedStyleRect, {"width":"10px","height":"10px","left": "auto","top": "auto"}, `computedStyleRect is wrong`);
    assert.deepEqual(metrics.border, {"left": 30,"top": 30,"right": 30,"bottom": 30}, `border is wrong`);
    assert.deepEqual(metrics.padding, {"left": 20,"top": 20,"right": 20,"bottom": 20}, `padding is wrong`);
    assert.deepEqual(metrics.margin, {"left": 1000,"top": 1000,"right": 1000,"bottom": 1000}, `margin is wrong`);
    assert.deepEqual(metrics.clientRect, {"top": 1000,"left": 1000,"bottom": 1110,"right": 1110,"width": 110,"height": 110}, `clientRect is wrong`);
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
    assert.equal(elem1.style.position, "", `position is wrong`); // position is already abs
    assert.deepEqual({"width": elem1.style.width,"height": elem1.style.height,"left": elem1.style.left,"top": elem1.style.top}, {"width": "30px", "height": "999px", "left": "", "top": ""}, `computedStyleRect is wrong`);
    assert.deepEqual({"left": elem1.style.borderLeft,"top": elem1.style.borderTop,"right": elem1.style.borderRight,"bottom": elem1.style.borderBottom}, {"left": "30px","top": "30px","right": "30px","bottom": "30px"}, `border is wrong`);
    assert.deepEqual({"left": elem1.style.paddingLeft,"top": elem1.style.paddingTop,"right": elem1.style.paddingRight,"bottom": elem1.style.paddingBottom}, {"left": "20px","top": "20px","right": "20px","bottom": "20px"}, `padding is wrong`);
    assert.deepEqual({"left": elem1.style.marginLeft,"top": elem1.style.marginTop,"right": elem1.style.marginRight,"bottom": elem1.style.marginBottom}, {"left": "1000px","top": "1000px","right": "1000px","bottom": "1000px"}, `margin is wrong`);
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
    assert.equal(window.scrollY, 0, `The scrollY should be "0" instead of '${window.scrollY}'`)
    assert.equal(window.scrollX, 0, `The scrollX should be "0" instead of '${window.scrollX}'`)

    // get scroll
    assert.equal(DomMetrics.getScroll(document).x, 0, `The scroll x should be "0" instead of '${DomMetrics.getScroll(document).x}'`)
    assert.equal(DomMetrics.getScroll(document).y, 0, `The scroll y should be "0" instead of '${DomMetrics.getScroll(document).y}'`)

    // scroll to
    DomMetrics.setScroll(document, {x: '10', y:10});
    assert.equal(window.scrollY, 10, `The scrollY should be "10" instead of '${window.scrollY}'`)
    assert.equal(window.scrollX, 10, `The scrollX should be "10" instead of '${window.scrollX}'`)
    assert.equal(DomMetrics.getScroll(document).x, 10, `The scroll x should be "10" instead of '${DomMetrics.getScroll(document).x}'`)
    assert.equal(DomMetrics.getScroll(document).y, 10, `The scroll y should be "10" instead of '${DomMetrics.getScroll(document).y}'`)
  });

  it('getScrollToShow a zone', function() {
    // check initial state
    const style = window.getComputedStyle(elem1);
    assert.equal(style.getPropertyValue('top'), '100px', `The element should have a height of '100px' instead of '${style.getPropertyValue('top')}'`)
    assert.equal(window.scrollY, 0, `The scrollY should be "0" instead of '${window.scrollY}'`)
    assert.equal(window.scrollX, 0, `The scrollX should be "0" instead of '${window.scrollX}'`)
    assert.equal(window.innerWidth, 400, `The window height should be "400" instead of '${window.innerWidth}'`)
    assert.equal(window.innerHeight, 300, `The window height should be "300" instead of '${window.innerHeight}'`)

    // element is already visible
    var bb = elem1.getBoundingClientRect();
    var scroll = DomMetrics.getScrollToShow(document, bb);
    assert.equal(scroll.y, 0, `The scrollY should be "0" instead of '${scroll.y}'`)
    assert.equal(scroll.x, 0, `The scrollX should be "0" instead of '${scroll.x}'`)


    // element not yet visible
    var bb = elem2.getBoundingClientRect();
    var scroll = DomMetrics.getScrollToShow(document, bb);
    // element position - size - SCROLL_ZONE_SIZE
    assert.equal(scroll.x, 160, `The scrollX should be "160" instead of '${scroll.x}'`)
    assert.equal(scroll.y, 260, `The scrollY should be "260" instead of '${scroll.y}'`)
  });
})
