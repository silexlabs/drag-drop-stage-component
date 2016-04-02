var should = require('should'),
  assert = require('assert'),
  jsdom = require('jsdom');

var Stage = require('../src/js/index').Stage;

describe('Stage', function() {
  
  // create some jsdom magic to allow jQuery to work
  var document = jsdom.jsdom('<iframe id="iframe" />'),
      window = document.parentWindow;
  
  it('should expose iframe doc and win', function() {
    var stage = new Stage(document.querySelector('#iframe'));
    stage.getIFrame().tagName.toUpperCase().should.equal('IFRAME');
    document.querySelector('#iframe').should.equal(stage.getIFrame());
    stage.getDocument().should.have.properties(['createElement', 'body']);
    stage.getWindow().should.have.properties(['location', 'name']);
  });
  it('add selectable', function() {
    var stage = new Stage(document.querySelector('#iframe')),
        doc = stage.getDocument(),
        win = stage.getWindow(),
        body = doc.body,
        head = doc.head,
        div = doc.createElement('div');
    
    div.style.width = div.style.height = '200px';
    div.style.backgroundColor = 'black';
    body.appendChild(div);
    stage.selection.listen(div);
  });
});