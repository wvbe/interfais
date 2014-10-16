module.exports = FocusManager;

function FocusManager(app) {
	var focusableItems = [],
		focusIndex = 0;

	this.init = function () {
	};


	this.addView = function (cell) {
		focusableItems.push(cell);
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
		++this.shifts;
		var i = focusIndex || 0;

		if (reverse)
			i = i === 0 ? focusableItems.length - 1 : --i;
		else
			i = i === focusableItems.length - 1 ? 0 : ++i;

		this.select(i);
	};

	// @TODO: Rename to focusManager()
	this.select = function (i) {
		if (!focusableItems[i])
			throw new Error('View ' + i + ' does not exist');
		if (typeof focusableItems[i].focus !== 'function')
			throw new Error('View ' + i + ' has no focus()');

		if (focusIndex !== null && focusableItems[focusIndex].blur)
			focusableItems[focusIndex].blur();

		focusIndex = i;
		focusableItems[i].focus();
	};

}