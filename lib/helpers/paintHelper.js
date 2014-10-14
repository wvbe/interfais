var charm = require('charm')(),
	stringHelper = require('./stringHelper');


module.exports = paint = {
	init: function() {
		charm.pipe(process.stdout);
		this.wipe();


		// @TODO: not sure if this belongs here
		process.on('exit', function () {
			//paint.wipe();
			charm.cursor(true);
		});
	},
	renderLine: function (start, line) {
		charm
			.position(start.x + 1, start.y)
			.write(line);

		return this;
	},

	renderRectangle: function (boundingBox, color) {
		paint.setBackground(color);

		for (var i = 0; i < boundingBox.height; i++)
			charm
				.position(boundingBox.x + 1, boundingBox.y + i)
				.write(stringHelper.resize('', boundingBox.width, true));


		return this;
	},

	setForeground: function (color) {
		if (!color)
			process.stdout.write('\x1b[39m');
		else
			charm.foreground(color);

		return this;
	},

	setBackground: function (color) {
		if (!color)
			process.stdout.write('\x1b[49m');
		else
			charm.background(color);

		return this;
	},

	/**
	 * Resets both fore- and background to terminal defaults
	 */
	resetColors: function () {
		process.stdout.write('\x1b[0m');

		return this;
	},


	wipe: function () {
		charm.reset();
		charm.cursor(false);
		process.stdout.write('\x1b[0m');

		return this;
	}

};

