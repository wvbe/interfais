var charm = require('charm')(),
	stringHelper = require('./stringHelper');


module.exports = paint = {
	init: function() {
		charm.pipe(process.stdout);
		charm.reset();
		charm.cursor(false);
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

	// @TODO: Implement this when needed, probably when starting on input UI
//	setCursor: function(x,y) {
//		if(typeof x === 'object') {
//			y = x.y;
//			x = x.x;
//		}
//		charm.position(x + 1, y);
//		return this;
//	},
//    renderAtPosition: function(line) {
//        charm
//            .write(line);
//    },
};

// @TODO: not sure if this belongs here
process.on('exit', function () {
	charm.background(0);
	charm.cursor(true);
	module.exports.resetColors();
});

