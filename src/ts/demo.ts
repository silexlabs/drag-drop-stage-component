import {Stage} from './index';
// find the empty iframe in the page
const iframe = document.querySelector('#iframe') as HTMLIFrameElement;
// write some content in the iframe
iframe.contentDocument.write(document.querySelector('#random-content').innerHTML);
// create the Stage class
const stage = new Stage(iframe, {
  onDrop: (selectables) => {
    console.log(`${ selectables.length } elements have been droped to ${ selectables[0].dropZone }`)
  },
  onDrag: (selectables) => {
    console.log(`${ selectables.length } elements have been draged to ${ selectables[0].dropZone }`)
  },
  onResize: (selectables) => {
    console.log(`${ selectables.length } elements have been resizeed to ${ selectables[0].dropZone }`)
  },
  onSelect: (selectables) => {
    console.log(`${ selectables.length } elements have been selected to ${ selectables[0].dropZone }`)
  },
});
