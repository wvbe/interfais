var charm = require('charm')(),
	stringHelper = require('./stringHelper');

/**
 * @namespace paintHelper
 */
module.exports = paint = {
	init: init,
	renderLine: renderLine,
	renderRectangle: renderRectangle,
	setBackground: setBackground,
	setForeground: setForeground,
	resetColors: resetColors,
	wipe: wipe
};


/**
 * Binds the painter to STDOUT and sets some less-vital event listeners
 * @memberof paintHelper
 */
function init () {
	charm.pipe(process.stdout);
	wipe();

	// @TODO: not sure if this belongs here
	process.on('exit', function () {
		//paint.wipe();
		charm.cursor(true);
	});
}


/**
 * @memberof paintHelper
 */
function wipe () {
	charm.reset();
	charm.cursor(false);
	process.stdout.write('\x1b[0m');
}


/**
 * Resets both fore- and background to terminal defaults
 * @memberof paintHelper
 */
function resetColors () {
	process.stdout.write('\x1b[0m');

	return this;
}


/**
 * {String|Number| color
 * @memberof paintHelper
 */
function setBackground (color) {
	if (!color)
		process.stdout.write('\x1b[49m');
	else
		charm.background(color);

	return this;
}


/**
 * {String|Number| color
 * @memberof paintHelper
 */
function setForeground (color) {
	if (!color)
		process.stdout.write('\x1b[39m');
	else
		charm.foreground(color);

	return this;
}


/**
 * @param {Object} boundingBox
 * @param {Number} boundingBox.x
 * @param {Number} boundingBox.y
 * @param {Number} boundingBox.width
 * @param {Number} boundingBox.height
 * @memberof paintHelper
 */
function renderRectangle(boundingBox, color) {
	paint.setBackground(color);

	for (var i = 0; i < boundingBox.height; i++)
		charm
			.position(boundingBox.x + 1, boundingBox.y + i)
			.write(stringHelper.resize('', boundingBox.width, true));


	return this;
}


/**
 * @param {Object} start
 * @param {Number} start.x
 * @param {Number} start.y
 * @param {String} line
 * @memberof paintHelper
 */
function renderLine (start, line) {
	charm
		.position(start.x + 1, start.y)
		.write(line);

	return this;
}