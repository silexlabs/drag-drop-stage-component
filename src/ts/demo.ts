import {Stage} from './index';
import * as domMetrics from './utils/DomMetrics';

// find the empty iframe in the page
const iframe = document.querySelector('#iframe') as HTMLIFrameElement;
// write some content in the iframe
iframe.contentDocument.write(document.querySelector('#random-content').innerHTML);
// create the Stage class
const stage = new Stage(iframe, {
  onDrop: (selectables) => {
    const dropElement = selectables[0].dropZone.parent;
    console.log(`${ selectables.length } elements have been droped to ${ dropElement.tagName.toLocaleLowerCase() }${ dropElement.id ? '#' + dropElement.id : '' }${ Array.from(dropElement.classList).map(c => '.' + c).join('') }`);
  },
  onDrag: (selectables) => {
    console.log(`${ selectables.length } elements are being draged`);
  },
  onResize: (selectables) => {
    console.log(`${ selectables.length } elements have been resizeed to ${JSON.stringify(domMetrics.getBoundingBox(selectables))}`);
  },
  onSelect: (selectables) => {
    console.log(`${ selectables.length } elements have been selected`);
  },
});
