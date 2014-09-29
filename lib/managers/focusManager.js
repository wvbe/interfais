module.exports = new FocusManager();

function FocusManager() {
	var focusableItems = [],
		focusIndex = null;

	this.addView = function (cell) {
		focusableItems.push(cell);
		if (focusIndex === null && typeof cell.setFocus === 'function') {
			this.select(focusableItems.length - 1);
		}
		return this;
	};

	this.removeView = function (cell) {
		focusableItems.splice(focusableItems.indexOf(cell), 1);
		return this;
	};

	this.getCurrent = function () {
		return focusableItems[focusIndex];
	};

	this.shift = function (reverse) {

		var i = focusIndex || 0;

		if (reverse)
			i = i === 0 ? focusableItems.length - 1 : --i;
		else
			i = i === focusableItems.length - 1 ? 0 : ++i;

		this.select(i);
	};

	this.select = function (i) {
		if (!focusableItems[i])
			throw new Error('View ' + i + ' does not exist');
		if (typeof focusableItems[i].setFocus !== 'function')
			throw new Error('View ' + i + ' has no focus()');

		if (focusIndex !== null && focusableItems[focusIndex].setBlur)
			focusableItems[focusIndex].setBlur();

		focusIndex = i;
		focusableItems[i].setFocus();

	};
}