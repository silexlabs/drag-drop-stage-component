import Event from "emitter-js";

class Selection extends Event {
  constructor(isSelectableHook) {
    super();
    this.selected = [];
    this.isSelectableHook = isSelectableHook;
  }
  toggle(selectable, keepPrevious) {
    let wasSelected = this.isSelected(selectable);
    if(keepPrevious === false)
      this.selected.forEach(el => this.remove(el, true));
    if(wasSelected === false)
      this.add(selectable, true);
    else
      this.remove(selectable, true);
    
    this.emit('change', this.selected.slice());
  }
  isSelected(selectable) {
    return this.selected.indexOf(selectable) >= 0;
  }
  /**
   * returns the first container which is selectable
   * or null if the element and none of its parents are selectable
   */
  getSelectable(element) {
    // let the main app specify getSelectable and getDroppable
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
    // empty the selection
    this.reset(true);
    // refil the selection
    elements.forEach(el => {
      this.add(el, true);
    });
    this.emit('change', this.selected.slice());
  }
  get() {
    return this.selected;
  }
}

exports.Selection = Selection
