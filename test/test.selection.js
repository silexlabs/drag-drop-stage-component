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
    assert.equal(elem1.className.toLowerCase(), 'selectable selected');
    assert.equal(selection.selected.length, 1);

    assert.equal(selection.isSelected(elem1), true);
    assert.equal(selection.isSelected(elem2), false);
  });

  it('should be able to select an element only one time', function() {
    document.body.innerHTML = '<div id="elem1" class="selectable" />';
    var elem1 = document.querySelector('#elem1');
    var selection = new Selection();

    selection.add(elem1);
    assert.equal(elem1.className.toLowerCase(), 'selectable selected');
    assert.equal(selection.selected.length, 1);

    selection.add(elem1);
    assert.equal(elem1.className.toLowerCase(), 'selectable selected');
    assert.equal(selection.selected.length, 1);
  });

  it('should be able to select 2 elements', function() {
    document.body.innerHTML = '<div id="elem1" class="selectable" /><div id="elem2" class="selectable" />';
    var elem1 = document.querySelector('#elem1');
    var elem2 = document.querySelector('#elem2');
    var selection = new Selection();

    selection.add(elem1);
    assert.equal(elem1.className.toLowerCase(), 'selectable selected');
    assert.equal(selection.selected.length, 1);

    selection.add(elem2);
    assert.equal(elem2.className.toLowerCase(), 'selectable selected');
    assert.equal(selection.selected.length, 2);
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
    assert.equal(elem1.className.toLowerCase(), 'selectable selected');
    assert.equal(elem2.className.toLowerCase(), 'selectable selected');
    assert.equal(elem3.className.toLowerCase(), 'selectable selected');
    assert.equal(selection.selected.length, 3);

    // a function which will do something only the first time it is called
    function removeElem2() {
      selection.remove(elem2);
      assert.equal(elem1.className.toLowerCase(), 'selectable selected');
      assert.equal(elem2.className.toLowerCase(), 'selectable');
      assert.equal(elem3.className.toLowerCase(), 'selectable selected');
      assert.equal(selection.selected.length, 2);
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
    assert.equal(elem1.className.toLowerCase(), 'selectable selected');
    assert.equal(elem2.className.toLowerCase(), 'selectable selected');
    assert.equal(elem3.className.toLowerCase(), 'selectable selected');
    assert.equal(selection.selected.length, 3);

    selection.reset();
    assert.equal(elem1.className.toLowerCase(), 'selectable');
    assert.equal(elem2.className.toLowerCase(), 'selectable');
    assert.equal(elem3.className.toLowerCase(), 'selectable');
    assert.equal(selection.selected.length, 0);
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

    assert.equal(elem1.className.toLowerCase(), 'selectable selected', 'elem1 should be selected');
    assert.equal(elem2.className.toLowerCase(), 'selectable', 'elem2 should not be selected');
    assert.equal(elem3.className.toLowerCase(), 'selectable', 'elem3 should not be selected');
    assert.equal(selection.selected.length, 1, 'there should only be 1 selected element');
  });

  it('should be able to set an arbitrary selection', function() {
    document.body.innerHTML = '<div id="elem1" class="selectable" /><div id="elem2" class="selectable" /><div id="elem3" class="selectable" />';
    var elem1 = document.querySelector('#elem1')
    var elem2 = document.querySelector('#elem2')
    var elem3 = document.querySelector('#elem3')
    var selection = new Selection();

    selection.set([elem1]);
    assert.equal(elem1.className.toLowerCase(), 'selectable selected');
    assert.equal(elem2.className.toLowerCase(), 'selectable');
    assert.equal(elem3.className.toLowerCase(), 'selectable');
    assert.equal(selection.selected.length, 1);

    selection.set([elem2, elem3]);
    assert.equal(elem1.className.toLowerCase(), 'selectable');
    assert.equal(elem2.className.toLowerCase(), 'selectable selected');
    assert.equal(elem3.className.toLowerCase(), 'selectable selected');
    assert.equal(selection.selected.length, 2);

    selection.set([]);
    assert.equal(elem1.className.toLowerCase(), 'selectable');
    assert.equal(elem2.className.toLowerCase(), 'selectable');
    assert.equal(elem3.className.toLowerCase(), 'selectable');
    assert.equal(selection.selected.length, 0);
  });
});
