import {Stage} from "./Stage";

window.onload = function() {
  var stage = new Stage(document.querySelector('#iframe'));
  var doc = stage.getDocument();
  var win = stage.getWindow();
  window.makeAbsolute = function () {
    stage.selection.selected.forEach(function(el) {
      el.style.position = 'absolute';
    });
  }
  window.addTemplate = function () {
    doc.body.appendChild(document.querySelector('#random-content').content);
  };
  window.addText = function () {
    var el = doc.createElement('p');
    el.classList.add('selectable', 'text-element');
    el.innerText = 'New Text Box';
    doc.body.appendChild(el);
  };
  stage.on('drop', e => {
    e.elementsData.forEach(data => {
      let destination = data.destination;
      let target = data.target;
      // reset relative position
      target.style.left = '0';
      target.style.top = '0';
      // move to a different container
      if(destination && destination.parent) {
        if(destination.nextElementSibling) {
          // if the target is not allready the sibling of the destination's sibling
          // and if the destination's sibling is not the target itself
          // then move to the desired position in the parent
          if(destination.nextElementSibling !== target.nextElementSibling && destination.nextElementSibling !== target) {
            target.parentNode.removeChild(target);
            destination.parent.insertBefore(target, destination.nextElementSibling);
          }
        }
        else {
          // if the destination parent is not already the target's parent
          // or if the target is not the last child
          // then append the target to the parent
          if(destination.parent !== target.parentNode || target.nextElementSibling) {
            target.parentNode.removeChild(target);
            destination.parent.appendChild(target);
          }
        }
      }
      // check the actual position of the target 
      // and move it to match the provided absolute position 
      let bb = target.getBoundingClientRect();
      target.style.left = (data.left - bb.left) + 'px';
      target.style.top = (data.top - bb.top) + 'px';
    });
  });
}