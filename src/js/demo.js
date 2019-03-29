import {Stage} from "./Stage";
window.addEventListener('load', function() {
  // find the empty iframe in the page
  const iframe = document.querySelector('#iframe');
  // write some content in the iframe
  iframe.contentDocument.write(document.querySelector('#random-content').innerHTML);
  // create the Stage class
  const stage = new Stage(iframe);
  // listen to the events and print in the console
  stage.on('drop', (elements) => {
    console.log(`${ elements.length } elements have been dropped to ${ elements[0].parentElement }`)
  });
  stage.on('selection', (elements) => {
    console.log(`${ elements.length } elements have been selected`)
  });
});
