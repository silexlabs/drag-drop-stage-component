class Selection {
	constructor() {
		console.log('Selection');
		this.selected = [];
	}
	toggle(element, keepPrevious) {
		console.log(`toggle ${element} ${keepPrevious}`);
		let wasSelected = this.isSelected(element);
		if(keepPrevious === false)
			this.selected.forEach(el => this.remove(el));
		if(wasSelected === false)
			this.add(element);
		else if(keepPrevious === true)
			this.remove(element);
	}
	isSelected(element) {
		return this.selected.indexOf(element) >= 0;
	}
	isSelectable(element) {
		return element.classList.contains('selectable');
	}
	remove(element) {
		let idx = this.selected.indexOf(element);
		if(idx >= 0) {
			element.classList.remove('selected');
			this.selected.splice(idx, 1);
		}
	}
	add(element) {
		if(this.isSelectable(element) && this.isSelected(element) === false) {
			element.classList.add('selected');
			this.selected.push(element);
		}
	}
}

exports.Selection = Selection
