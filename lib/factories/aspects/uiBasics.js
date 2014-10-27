var renderHelper = require('../../helpers/renderHelper');

module.exports = function(app, Ui) {


	/**
	 * Fills a line with emptyness.
	 * @method Ui#spacer
	 * @returns {Ui}
	 */

	/**
	 * Fills a line by repeating given char.
	 * @method Ui#ruler
	 * @param {String} char
	 * @returns {Ui}
	 */

	/**
	 * One line that is clipped to content width if neccessary
	 * @method Ui#line
	 * @param {String|Array.<String>} lines
	 * @returns {Ui}
	 */

	/**
	 * Display key/value pairs, kinda looks like a 2 column table
	 * @method Ui#keyValue
	 * @param {Object|Array.<Object>} pairs - An object, or an array of `{key: ..., value: ...}` objects
	 * @param {Object} [options]
	 * @param {String} [options.seperator] Characters between key and aligned values, defaults to four spaces.
	 * @param {Number} [options.keyWidth] SOON: Length of key column, WORKS: defaults to the length of the longest key
	 * @returns {Ui}
	 */

	/**
	 * @method Ui#list
	 * @param {String|Array.<String>} text
	 * @returns {Ui}
	 */

	/**
	 * One or more lines that wrap
	 * @method Ui#paragraph
	 * @param {String|Array.<String>} text
	 * @param {Object} [formatting]
	 * @returns {Ui}
	 */
	Object.keys(renderHelper).forEach(function (renderMethod) {
		Ui.prototype[renderMethod] = function () {
			Ui.queue.apply(this, [renderHelper[renderMethod], arguments]);
			return this;
		};
	});

	/**
	 * @method Ui#background
	 * @param {String|Number}    color
	 * @returns {Ui}
	 */
	Ui.prototype.background = function (color) {
		this._background = color;
		return this;
	};

	/**
	 * @method Ui#foreground
	 * @param {String|Number}    color
	 * @returns {Ui}
	 */
	Ui.prototype.foreground = function (color) {
		this._foreground = color;
		return this;
	};

	/**
	 * Queue a page header for render. Is capitalized and underlined.
	 * @method Ui#h1
	 * @param {String|Function} text
	 * @returns {Ui}
	 */
	Ui.prototype.h1 = function (text) {
		Ui.queue.apply(this, [renderHelper.line, arguments, {
			underline: true,
			uppercase: true
		}]);
		this.spacer();
		return this;
	};

	/**
	 * Queue a page header for render. Is underlined, but not capitalized like h1
	 * @method Ui#h2
	 * @param {String|Function} text
	 * @returns {Ui}
	 */
	Ui.prototype.h2 = function (text) {
		Ui.queue.apply(this, [renderHelper.line, arguments, {
			underline: true
		}]);
		this.spacer();
		return this;
	};

	/**
	 * Refresh at this interval while UI is visible
	 * @method Ui#interval
	 * @param {Number} milliseconds
	 * @returns {Ui}
	 */
	Ui.prototype.interval = function (milliseconds) {
		this.interval = milliseconds || false;
		return this;
	};
};