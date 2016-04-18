var should = require('should'),
  assert = require('assert'),
  jsdom = require('mocha-jsdom');

describe('Stage', function() {

  var Stage;
  
  // create some jsdom magic to allow jQuery to work
  jsdom();

  before(function () {
    document.body.innerHTML = '<iframe id="iframe" />';
    Stage = require('../src/js/index').Stage;
  })

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
  });
});