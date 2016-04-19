var should = require('should'),
  assert = require('assert'),
  jsdom = require('mocha-jsdom');

describe('Selection', function() {

  var Selection;
  
  // create some jsdom magic to allow jQuery to work
  jsdom();

  before(function () {
    Selection = require('../src/js/Selection.js').Selection;
  })

  it('should be able to select an element and then know it is selected', function() {
    document.body.innerHTML = '<div id="elem1" class="selectable" /><div id="elem2" class="selectable" />';
    var elem1 = document.querySelector('#elem1');
    var elem2 = document.querySelector('#elem2');
    var selection = new Selection();

    selection.add(elem1);
    elem1.className.should.equal('selectable selected');
    selection.selected.length.should.equal(1);

    selection.isSelected(elem1).should.be.true();
    selection.isSelected(elem2).should.be.false();
  });

  it('should be able to select an element only one time', function() {
    document.body.innerHTML = '<div id="elem1" class="selectable" />';
    var elem1 = document.querySelector('#elem1');
    var selection = new Selection();

    selection.add(elem1);
    elem1.className.should.equal('selectable selected');
    selection.selected.length.should.equal(1);

    selection.add(elem1);
    elem1.className.should.equal('selectable selected');
    selection.selected.length.should.equal(1);
  });

  it('should be able to select 2 elements', function() {
    document.body.innerHTML = '<div id="elem1" class="selectable" /><div id="elem2" class="selectable" />';
    var elem1 = document.querySelector('#elem1');
    var elem2 = document.querySelector('#elem2');
    var selection = new Selection();

    selection.add(elem1);
    elem1.className.should.equal('selectable selected');
    selection.selected.length.should.equal(1);

    selection.add(elem2);
    elem2.className.should.equal('selectable selected');
    selection.selected.length.should.equal(2);
  });

  it('should be able to remove 1 of zero or several elements', function() {
    document.body.innerHTML = '<div id="elem1" class="selectable" /><div id="elem2" class="selectable" /><div id="elem3" class="selectable" />';
    var elem1 = document.querySelector('#elem1');
    var elem2 = document.querySelector('#elem2');
    var elem3 = document.querySelector('#elem3');
    var selection = new Selection();

    selection.add(elem1);
    selection.add(elem2);
    selection.add(elem3);
    elem1.className.should.equal('selectable selected');
    elem2.className.should.equal('selectable selected');
    elem3.className.should.equal('selectable selected');
    selection.selected.length.should.equal(3);

    // a function which will do something only the first time it is called
    function removeElem2() {
      selection.remove(elem2);
      elem1.className.should.equal('selectable selected');
      elem2.className.should.equal('selectable');
      elem3.className.should.equal('selectable selected');
      selection.selected.length.should.equal(2);
    }
    removeElem2();
    removeElem2();
  });

  it('should be able to reset / remove all elements', function() {
    document.body.innerHTML = '<div id="elem1" class="selectable" /><div id="elem2" class="selectable" /><div id="elem3" class="selectable" />';
    var elem1 = document.querySelector('#elem1');
    var elem2 = document.querySelector('#elem2');
    var elem3 = document.querySelector('#elem3');
    var selection = new Selection();

    selection.add(elem1);
    selection.add(elem2);
    selection.add(elem3);
    elem1.className.should.equal('selectable selected');
    elem2.className.should.equal('selectable selected');
    elem3.className.should.equal('selectable selected');
    selection.selected.length.should.equal(3);

    selection.reset();
    elem1.className.should.equal('selectable');
    elem2.className.should.equal('selectable');
    elem3.className.should.equal('selectable');
    selection.selected.length.should.equal(0);
  });

  it('should be able to toggle elements', function() {
    document.body.innerHTML = '<div id="elem1" class="selectable" /><div id="elem2" class="selectable" /><div id="elem3" class="selectable" />';
    var elem1 = document.querySelector('#elem1');
    var elem2 = document.querySelector('#elem2');
    var elem3 = document.querySelector('#elem3');
    var selection = new Selection();

    selection.toggle(elem1);
    selection.add(elem2);
    selection.toggle(elem2);
    selection.toggle(elem3);
    selection.toggle(elem3);

    elem1.className.should.equal('selectable selected');
    elem2.className.should.equal('selectable');
    elem3.className.should.equal('selectable');

    selection.selected.length.should.equal(1);
  });

  it('should be able to set an arbitrary selection', function() {
    document.body.innerHTML = '<div id="elem1" class="selectable" /><div id="elem2" class="selectable" /><div id="elem3" class="selectable" />';
    var elem1 = document.querySelector('#elem1')
    var elem2 = document.querySelector('#elem2')
    var elem3 = document.querySelector('#elem3')
    var selection = new Selection();

    selection.set([elem1]);
    elem1.className.should.equal('selectable selected');
    elem2.className.should.equal('selectable');
    elem3.className.should.equal('selectable');
    selection.selected.length.should.equal(1);

    selection.set([elem2, elem3]);
    elem1.className.should.equal('selectable');
    elem2.className.should.equal('selectable selected');
    elem3.className.should.equal('selectable selected');
    selection.selected.length.should.equal(2);

    selection.set([]);
    elem1.className.should.equal('selectable');
    elem2.className.should.equal('selectable');
    elem3.className.should.equal('selectable');
    selection.selected.length.should.equal(0);
  });
});