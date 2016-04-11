class MoveHandler {
  constructor(elements, e) {
    console.log('MoveHandler', elements, e);
    this.elements = elements.map((el) => {
      return {target: el, style: el.style};
    });
    this.elements.forEach((elementData) => {
      let el = elementData.target;
      el.style.position = 'absolute';
      let computed = getComputedStyle(el);
      let left = parseFloat(computed.left) || e.pageX;
      let right = parseFloat(computed.top) || e.pageY;
      let parent = getComputedStyle(el.parentNode);
      let relativeLeft = left + (parseFloat(parent.left) || 0);
      let relativeRight = right + (parseFloat(parent.top) || 0);
      el.style.left = relativeLeft + 'px';
      el.style.top = relativeRight + 'px';
    });
    let {left, top} = this.elements
    .map((el) => {
      return {
        left: parseFloat(el.style.left),
        top: parseFloat(el.style.top),
      };
    })
    .reduce((obj1, obj2) => {
      return {
          left: Math.min(obj1.left, obj2.left),
          top: Math.min(obj1.top, obj2.top),
        };
    });
  }
  update(e) {
    this.elements.forEach((elementData) => {
      let el = elementData.target;
      el.style.left = (parseFloat(el.style.left) + e.movementX) + 'px';
      el.style.top = (parseFloat(el.style.top) + e.movementY) + 'px';
    });
  }
  release(e) {
    console.log('MoveHandler', this.elements, e.movementX);
    this.elements.forEach((elementData) => {
      let el = elementData.target;
      console.log('xxx', elementData);
      el.style = elementData.style;
    });
  }
}

exports.MoveHandler = MoveHandler;
