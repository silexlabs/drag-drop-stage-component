class Selection {
	constructor() {
		this.selected = [];
	}
	toggle(selectable, keepPrevious) {
		let wasSelected = this.isSelected(selectable);
		if(keepPrevious === false)
			this.selected.forEach(el => this.remove(el));
		if(wasSelected === false)
			this.add(selectable);
		else if(keepPrevious === true)
			this.remove(selectable);
	}
	isSelected(selectable) {
		return this.selected.indexOf(selectable) >= 0;
	}
	/**
	 * returns the first container which is selectable
	 * or null if the element and none of its parents are selectable
	 */
	getSelectable(element) {
		// TODO: abstraction for getSelectable and getDroppable and getSelected
		return element.closest('.selectable');
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
			this.remove(this.selected[0]);
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
			this.add(el);
		});
	}
}

exports.Selection = Selection
