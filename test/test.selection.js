var assert = require('assert');

describe('Selection', function() {

  var Selection;

  before(function () {
    Selection = require('../src/js/Selection.js').Selection;
  })

  it('should be able to select an element and then know it is selected', function() {
    document.body.innerHTML = '<div id="elem1" class="selectable" /><div id="elem2" class="selectable" />';
    var elem1 = document.querySelector('#elem1');
    var elem2 = document.querySelector('#elem2');
    var selection = new Selection();

    selection.add(elem1);
    assert.equal('selectable selected', elem1.className.toLowerCase());
    assert.equal(1, selection.selected.length);

    assert.equal(true, selection.isSelected(elem1));
    assert.equal(false, selection.isSelected(elem2));
  });

  it('should be able to select an element only one time', function() {
    document.body.innerHTML = '<div id="elem1" class="selectable" />';
    var elem1 = document.querySelector('#elem1');
    var selection = new Selection();

    selection.add(elem1);
    assert.equal('selectable selected', elem1.className.toLowerCase());
    assert.equal(1, selection.selected.length);

    selection.add(elem1);
    assert.equal('selectable selected', elem1.className.toLowerCase());
    assert.equal(1, selection.selected.length);
  });

  it('should be able to select 2 elements', function() {
    document.body.innerHTML = '<div id="elem1" class="selectable" /><div id="elem2" class="selectable" />';
    var elem1 = document.querySelector('#elem1');
    var elem2 = document.querySelector('#elem2');
    var selection = new Selection();

    selection.add(elem1);
    assert.equal('selectable selected', elem1.className.toLowerCase());
    assert.equal(1, selection.selected.length);

    selection.add(elem2);
    assert.equal('selectable selected', elem2.className.toLowerCase());
    assert.equal(2, selection.selected.length);
  });

  it('should be able to remove 1 of zero or several elements', function() {
    document.body.innerHTML = '<div id="elem1" class="selectable" /><div id="elem2" class="selectable" /><div id="elem3" class="selectable" />';
    var elem1 = document.querySelector('#elem1');
    var elem2 = document.querySelector('#elem2');
    var elem3 = document.querySelector('#elem3');
    var selection = new Selection();

    selection.add(elem1);
    selection.add(elem2);
    selection.add(elem2);
    selection.add(elem3);
    assert.equal('selectable selected', elem1.className.toLowerCase());
    assert.equal('selectable selected', elem2.className.toLowerCase());
    assert.equal('selectable selected', elem3.className.toLowerCase());
    assert.equal(3, selection.selected.length);

    // a function which will do something only the first time it is called
    function removeElem2() {
      selection.remove(elem2);
      assert.equal('selectable selected', elem1.className.toLowerCase());
      assert.equal('selectable', elem2.className.toLowerCase());
      assert.equal('selectable selected', elem3.className.toLowerCase());
      assert.equal(2, selection.selected.length);
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
    assert.equal('selectable selected', elem1.className.toLowerCase());
    assert.equal('selectable selected', elem2.className.toLowerCase());
    assert.equal('selectable selected', elem3.className.toLowerCase());
    assert.equal(3, selection.selected.length);

    selection.reset();
    assert.equal('selectable', elem1.className.toLowerCase());
    assert.equal('selectable', elem2.className.toLowerCase());
    assert.equal('selectable', elem3.className.toLowerCase());
    assert.equal(0, selection.selected.length);
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

    assert.equal('selectable selected', elem1.className.toLowerCase());
    assert.equal('selectable', elem2.className.toLowerCase());
    assert.equal('selectable', elem3.className.toLowerCase());
    assert.equal(1, selection.selected.length);
  });

  it('should be able to set an arbitrary selection', function() {
    document.body.innerHTML = '<div id="elem1" class="selectable" /><div id="elem2" class="selectable" /><div id="elem3" class="selectable" />';
    var elem1 = document.querySelector('#elem1')
    var elem2 = document.querySelector('#elem2')
    var elem3 = document.querySelector('#elem3')
    var selection = new Selection();

    selection.set([elem1]);
    assert.equal('selectable selected', elem1.className.toLowerCase());
    assert.equal('selectable', elem2.className.toLowerCase());
    assert.equal('selectable', elem3.className.toLowerCase());
    assert.equal(1, selection.selected.length);

    selection.set([elem2, elem3]);
    assert.equal('selectable', elem1.className.toLowerCase());
    assert.equal('selectable selected', elem2.className.toLowerCase());
    assert.equal('selectable selected', elem3.className.toLowerCase());
    assert.equal(2, selection.selected.length);

    selection.set([]);
    assert.equal('selectable', elem1.className.toLowerCase());
    assert.equal('selectable', elem2.className.toLowerCase());
    assert.equal('selectable', elem3.className.toLowerCase());
    assert.equal(0, selection.selected.length);
  });
});
