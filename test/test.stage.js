var assert = require('assert');

describe('Stage', function() {

  var Stage;

  before(function () {
    document.body.innerHTML = '<iframe id="iframe" />';
    Stage = require('../src/js/index').Stage;
  })

  it('should expose iframe doc and win', function() {
    var stage = new Stage(document.querySelector('#iframe'));
    assert.equal(stage.iframe.tagName.toUpperCase(), 'IFRAME');
    assert.equal(document.querySelector('#iframe'), stage.iframe);
    assert.notEqual(undefined, stage.contentDocument.createElement);
    assert.notEqual(undefined, stage.contentDocument.body);
    assert.notEqual(undefined, stage.contentWindow.location);
    assert.notEqual(undefined, stage.contentWindow.name);
  });
});