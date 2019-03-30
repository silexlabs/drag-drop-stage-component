import Event from "emitter-js";

class Selection extends Event {
  constructor(isSelectableHook) {
    super();
    this.selected = [];
    this.isSelectableHook = isSelectableHook;
  }
  toggle(selectable) {
    if(this.isSelected(selectable))
      this.remove(selectable);
    else
      this.add(selectable);
  }
  isSelected(selectable) {
    return this.selected.includes(selectable);
  }
  /**
   * returns the first container which is selectable
   * or null if the element and none of its parents are selectable
   */
  getSelectable(element) {
    // let the main app.map(el) specify getSelectable and getDroppable
    let ptr = element;
    while(ptr && !this.isSelectableHook(ptr)) {
      ptr = ptr.parentElement;
    }
    return ptr;
  }
  remove(selectable, preventEmit=false) {
    let idx = this.selected.indexOf(selectable);
    if(idx >= 0) {
      selectable.classList.remove('selected');
      this.selected.splice(idx, 1);
      if(!preventEmit) this.emit('change', this.selected.slice());
    }
  }
  reset(preventEmit=false) {
    while(this.selected.length > 0) {
      this.remove(this.selected[0], true);
    }
    if(!preventEmit) this.emit('change', this.selected.slice());
  }
  add(selectable, preventEmit=false) {
    if(selectable && this.isSelected(selectable) === false) {
      selectable.classList.add('selected');
      this.selected.push(selectable);
      if(!preventEmit) this.emit('change', this.selected.slice());
    }
  }
  set(elements) {
    if(!Selection.isEqual(elements, this.selected)) {
      // empty the selection
      this.reset(true);
      // refil the selection
      elements.forEach(el => {
        this.add(el, true);
      });
      this.emit('change', this.selected.slice());
    }
  }
  get() {
    return this.selected;
  }

  /**
   * compare 2 arrays, just the references to elements
   * this could also be done with JSON.stringify but it breaks the unit tests (circular reference)
   * and I like it better like that
   * @param {Array<Element>} a1
   * @param {Array<Element>} a2
   */
  static isEqual(a1, a2) {
    return a1
    .filter(el => !a2.includes(el))
    .concat(a2
    .filter(el => !a1.includes(el)))
    .length === 0;
  }
}

exports.Selection = Selection
