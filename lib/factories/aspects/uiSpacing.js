
var BOX_DEFAULTS = {
	width: 120,
	height: 60,
	x: 0,
	y: 0
};

module.exports = function(app, uiFactory) {

	/**
	 * Get the available width for ASCII content, in columns.
	 * @returns {number}
	 */
	uiFactory.prototype.getContentWidth = function () {
		return this._box.width - 2 * this._margin.x - 2 * this._padding.x;
	};


	/**
	 * Define the boundingBox of renderings to come.
	 * @param {Number|Object}    width      width in number of columns, or the entire _box variable. Should not be < 1.
	 * @param {Number}          [height]    Should not be < 1.
	 * @param {Number}          [x]
	 * @param {Number}          [y]
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.within = function (width, height, x, y) {
		if (typeof width === 'object') {
			var self = this;
			Object.keys(BOX_DEFAULTS).forEach(function (dimension) {
				self._box[dimension] = width[dimension] || BOX_DEFAULTS[dimension];
			});
		} else {

			this._box = {
				width: width || BOX_DEFAULTS.width,
				height: height || BOX_DEFAULTS.height,
				x: x || BOX_DEFAULTS.x,
				y: y || BOX_DEFAULTS.y
			};
		}

		this.clear();

		return this;
	};

	/**
	 * Add padding to the eventual output, space between the background and ascii content.
	 * @param {Number}    vertical        In rows.
	 * @param {Number}    [horizontal]    In columns
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.padding = function (vertical, horizontal) {

		if (horizontal == undefined)
			horizontal = vertical;

		this._padding = {
			x: horizontal,
			y: vertical
		};

		return this;
	};

	/**
	 * Add margin to the eventual output, space between the background and boundingbox.
	 * @param {Number}    vertical        In rows.
	 * @param {Number}    [horizontal]    In columns
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.margin = function (vertical, horizontal) {

		if (horizontal == undefined)
			horizontal = vertical;

		this._margin = {
			x: horizontal,
			y: vertical
		};

		return this;
	};
};