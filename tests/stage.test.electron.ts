import {Stage} from '../src/ts/index';

class StageTest extends Stage {
  getIframe() { return this.iframe }
  getContentDocument() { return this.contentDocument }
  getContentWindow() { return this.contentWindow }
}

describe('Stage', () => {
  beforeEach(() => {
    document.body.innerHTML = '<iframe id="iframe" />';
  })

  it('should expose iframe doc and win', () => {
    var stage = new StageTest(document.querySelector('#iframe'), document.querySelectorAll('*'));
    expect(stage.getIframe().tagName.toUpperCase()).toBe('IFRAME');
    expect(document.querySelector('#iframe')).toBe(stage.getIframe());
    expect(stage.getContentDocument().createElement).not.toBeNull();
    expect(stage.getContentDocument().body).not.toBeNull();
    expect(stage.getContentWindow().location).not.toBeNull();
    expect(stage.getContentWindow().name).not.toBeNull();
  });
});
