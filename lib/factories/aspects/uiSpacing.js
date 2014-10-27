var BOX_DEFAULTS = {
	width: 120,
	height: 60,
	x: 0,
	y: 0
};

module.exports = function(app, Ui) {

	/**
	 * Get the available width for ASCII content, in columns.
	 * @method Ui#getContentWidth
	 * @returns {number}
	 */
	Ui.prototype.getContentWidth = function () {
		return this._box.width - 2 * this._margin.x - 2 * this._padding.x;
	};

	/**
	 * Define the boundingBox of renderings to come.
	 * @method Ui#within
	 * @param {Number|Object}    width      width in number of columns, or the entire _box variable. Should not be < 1.
	 * @param {Number}          [height]    Should not be < 1.
	 * @param {Number}          [x]
	 * @param {Number}          [y]
	 * @returns {Ui}
	 */
	Ui.prototype.within = function (width, height, x, y) {
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
	 * @method Ui#padding
	 * @param {Number}    vertical        In rows.
	 * @param {Number}    [horizontal]    In columns
	 * @returns {Ui}
	 */
	Ui.prototype.padding = function (vertical, horizontal) {

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
	 * @method Ui#margin
	 * @param {Number}    vertical        In rows.
	 * @param {Number}    [horizontal]    In columns
	 * @returns {Ui}
	 */
	Ui.prototype.margin = function (vertical, horizontal) {

		if (horizontal == undefined)
			horizontal = vertical;

		this._margin = {
			x: horizontal,
			y: vertical
		};

		return this;
	};
};