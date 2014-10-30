var RecursiveObject = require('./RecursiveObject');

/*
 * @param {Object} options
 * @param {Number} [options.width]
 * @param {Number} [options.height]
 * @returns {Cell}
 * @constructor
 */
function Layout (options) {
	RecursiveObject.apply(this, arguments);

	return this;
}

Layout.prototype = new RecursiveObject;

Layout.prototype.prerender = function () {
	var prerendered = this.availableSpace();

	prerendered.x = 0;
	prerendered.y = 1;

	this.prerendered = prerendered;

	this.getChildren().forEach(function (row, i, children) {
		row.prerender(
			prerendered, // Bounding box
			i > 0
				? children[i - 1].prerendered
				: { x: prerendered.x, y: prerendered.y } // Previous sibling, or parent x&y
		);
	});
};

Layout.prototype.render = function () {
	this.getChildren().forEach(function (cell) {
		cell.render();
	});

	return this;
};

Layout.prototype.availableSpace = function () {
	var size = {
		width:  this.width  || process.stdout.columns,
		height: this.height || process.stdout.rows
	};

	// TODO: When the screen resizes (from large to small or the other way around) and the width comes past a point that
	// a flowing column (view content, it appears) should or should no longer be rendered, the system crashes. This appears
	// to be caused by an infinite loop, process with exit after out-of-memory.
	// To avoid, width is hardcoded to 60, here's hoping
	if (size.width < 60)
		size.width = 60;
	if (size.height < 10)
		size.height = 10;

	return size;
};

module.exports = Layout;
