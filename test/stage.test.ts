// import {Stage} from '../src/ts/index';

// describe('Stage', () => {
//   beforeEach(() => {
//     document.body.innerHTML = '<iframe id="iframe" />';
//   })

//   it('should expose iframe doc and win', () => {
//     var stage = new Stage(document.querySelector('#iframe'));
//     expect(stage.iframe.tagName.toUpperCase()).toBe('IFRAME');
//     expect(document.querySelector('#iframe')).toBe(stage.iframe);
//     expect(stage.contentDocument.createElement).not.toBeNull();
//     expect(stage.contentDocument.body).not.toBeNull();
//     expect(stage.contentWindow.location).not.toBeNull();
//     expect(stage.contentWindow.name).not.toBeNull();
//   });
// });