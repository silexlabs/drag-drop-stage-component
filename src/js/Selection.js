class Selection {
  constructor(isSelectableHook=null) {
    this.selected = [];
    this.isSelectableHook = isSelectableHook;
  }
  toggle(selectable, keepPrevious) {
    let wasSelected = this.isSelected(selectable);
    if(keepPrevious === false)
      this.selected.forEach(el => this.remove(el, true));
    if(wasSelected === false)
      this.add(selectable);
    else
      this.remove(selectable);
  }
  isSelected(selectable) {
    return this.selected.indexOf(selectable) >= 0;
  }
  hasASelectedParent(selectable) {
    const selectableParent = this.getSelectable(selectable.parentElement);
    if(selectableParent) {
      if(this.isSelected(selectableParent)) return true;
      else return this.hasASelectedParent(selectableParent);
    }
    else {
      return false;
    }
  }
  /**
   * returns the first container which is selectable
   * or null if the element and none of its parents are selectable
   */
  getSelectable(element) {
    // let the main app specify getSelectable and getDroppable
    if(this.isSelectableHook) {
      let ptr = element;
      while(ptr && !this.isSelectableHook(ptr)) {
        prt = ptr.parentElement;
      }
      return ptr;
    }
    else return element.closest('.selectable');
  }
  remove(selectable) {
    let idx = this.selected.indexOf(selectable);
    if(idx >= 0) {
      selectable.classList.remove('selected');
      this.selected.splice(idx, 1);
    }
  }
  reset() {
    while(this.selected.length > 0) {
      this.remove(this.selected[0], true);
    }
  }
  add(selectable) {
    if(selectable && this.isSelected(selectable) === false) {
      selectable.classList.add('selected');
      this.selected.push(selectable);
      }
  }
  set(elements) {
    // empty the selection
    this.reset();
    // refil the selection
    elements.forEach(el => {
      this.add(el, true);
    });
  }
  get() {
    return this.selected;
  }
}

exports.Selection = Selection
