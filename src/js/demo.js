import {Stage} from "./Stage";

window.onload = function() {
  document.querySelector('#iframe').contentDocument.write(document.querySelector('#random-content').innerHTML);
  var stage = new Stage(document.querySelector('#iframe'));
  var doc = stage.getDocument();
  var win = stage.getWindow();
  stage.on('drop', e => {
    if(e.elementsData) {
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
    }
  });
}
