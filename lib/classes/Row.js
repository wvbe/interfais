var RecursiveObject = require('./RecursiveObject');

/*
 * @param {Object} options
 * @param {Number} [options.height]
 * @returns {Row}
 * @constructor
 */
function Row(options) {
	RecursiveObject.apply(this, arguments);

	return this;
}

Row.prototype = new RecursiveObject;

Row.prototype.setAsFocused = function () {
	this.menu.setAsFocused();
};


Row.prototype.prerender = function (confinement, previousSibling) {
	var self = this,
		prerendered = self.availableSpace(confinement);

	prerendered.x = previousSibling.x;
	prerendered.y = previousSibling.y + (previousSibling.height || 0);

	this.prerendered = prerendered;

	this.getChildren().forEach(function (cell, i, children) {
		cell.prerender(prerendered, i > 0 ? children[i - 1].prerendered : { x: prerendered.x, y: prerendered.y });
	});
};

Row.prototype.availableSpace = function (parentSize) {
	var height = this.height;

	if (!height) {
		// @TODO: Find a more DRY way to do this and the Cell scenario
		height = this.getParent().prerendered.height;
		var competition = 1;
		this.getSiblings().forEach(function (cell) {
			if (cell.height)
				height -= cell.height;
			else
				++competition;
		});
		height = height / competition;
	}

	return {
		width: parentSize.width,
		height: height
	};
};


Row.prototype.render = function () {
	this.getChildren().forEach(function (cell) {
		cell.render();
	});

	return this;
};


module.exports = Row;
