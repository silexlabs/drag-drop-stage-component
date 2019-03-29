import {Stage} from "./Stage";

window.onload = function() {
  document.querySelector('#iframe').contentDocument.write(document.querySelector('#random-content').innerHTML);
  var stage = new Stage(document.querySelector('#iframe'));
  stage.on('drop', (elements, container) => {
    console.log(`${ elements.length } elements have been dropped to ${ elements[0].parentElement }`)
  });
}
