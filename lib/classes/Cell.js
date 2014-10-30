var RecursiveObject = require('./RecursiveObject');

/*
 * @param {Object} options
 * @param {Number} [options.width]
 * @returns {Cell}
 * @constructor
 */
function Cell (options) {
	RecursiveObject.apply(this, arguments);
	return this;
}

Cell.prototype = new RecursiveObject;


Cell.prototype.focus = function () {
	if (this.view && typeof this.view.focus === 'function')
		this.view.focus();
};

Cell.prototype.blur = function () {
	if (this.view && typeof this.view.blur === 'function')
		this.view.blur();
};

Cell.prototype.prerender = function (confinement, previousSibling) {
	var self = this,
		prerendered = self.availableSpace(confinement);

	prerendered.x = previousSibling.x + (previousSibling.width || 0);
	prerendered.y = previousSibling.y;

	this.prerendered = prerendered;
	if (this.view && this.view.prerender)
		this.view.prerender();
};


Cell.prototype.render = function () {
	if (!this.view)
		return;

	if (!this.prerendered)
		return;

	if (!this.prerendered.width || this.prerendered.width <= 0)
		return;

	if (!this.prerendered.height || this.prerendered.height <= 0)
		return;

	this.view.render();
};

Cell.prototype.setView = function (view, args) {
	if (this.view && typeof this.view.close === 'function')
		this.view.close();

	delete this.view;

	this.view = new view(this, args);

	if (typeof this.view.open === 'function') {
		this.view.open();
	}

	if (this.prerendered) {
		this.view.prerender();
		this.render();
	}

	return this;
};

Cell.prototype.availableSpace = function (parentSize) {
	var width = this.width;

	if (!width) {
		// @TODO: Allow callback to calc width (fn(parent.width, parent.height){})
		// @TODO: Find a more DRY way to do this and the Row scenario
		width = this.getParent().prerendered.width;
		var competition = 1;
		this.getSiblings().forEach(function (cell) {
			if (cell.width)
				width -= cell.width;
			else
				++competition;
		});
		width = width / competition;
	}

	return {
		width: width,
		height: parentSize.height
	};
};


module.exports = Cell;