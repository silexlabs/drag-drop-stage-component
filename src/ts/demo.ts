import {Stage} from './index';

// find the empty iframe in the page
const iframe = document.querySelector('#iframe') as HTMLIFrameElement;
const output = document.querySelector('#output') as HTMLInputElement;
// write some content in the iframe
iframe.contentDocument.write(document.querySelector('#random-content').innerHTML);
// create the Stage class
new Stage(iframe, iframe.contentDocument.querySelectorAll('.stage-element'), {
  onDrop: (selectables) => {
    const dropElement = selectables[0].dropZone.parent;
    const str = `${ selectables.length } elements have been droped to ${ dropElement.tagName.toLocaleLowerCase() }${ dropElement.id ? '#' + dropElement.id : '' }${ Array.from(dropElement.classList).map(c => '.' + c).join('') }`;
    console.log(str);
    output.value = str;
  },
  onDrag: (selectables, boundingBox) => {
    const str = `${ selectables.length } elements are being draged`;
    console.log(str);
    output.value = str;
  },
  onResize: (selectables, boundingBox) => {
    const str = `${ selectables.length } elements have been resizeed to ${JSON.stringify(boundingBox)}`;
    console.log(str);
    output.value = str;
  },
  onDraw: (selectables, boundingBox) => {
    const str = `Drawing region: ${JSON.stringify(boundingBox)}`;
    console.log(str);
    output.value = str;
  },
  onSelect: (selectables) => {
    const str = `${ selectables.length } elements have been (un)selected`;
    console.log(str);
    output.value = str;
  },
});
