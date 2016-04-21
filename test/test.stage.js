var assert = require('assert');

describe('Stage', function() {

  var Stage;

  before(function () {
    document.body.innerHTML = '<iframe id="iframe" />';
    Stage = require('../src/js/index').Stage;
  })

  it('should expose iframe doc and win', function() {
    var stage = new Stage(document.querySelector('#iframe'));
    assert.equal('IFRAME', stage.getIFrame().tagName.toUpperCase());
    assert.equal(stage.getIFrame(), document.querySelector('#iframe'));
    assert.notEqual(undefined, stage.getDocument().createElement);
    assert.notEqual(undefined, stage.getDocument().body);
    assert.notEqual(undefined, stage.getWindow().location);
    assert.notEqual(undefined, stage.getWindow().name);
  });
  it('should add a selectable', function() {
    var stage = new Stage(document.querySelector('#iframe')),
        doc = stage.getDocument(),
        win = stage.getWindow(),
        body = doc.body,
        head = doc.head,
        div = doc.createElement('div');
    
    div.style.width = div.style.height = '200px';
    div.style.backgroundColor = 'black';
    body.appendChild(div);
  });
});