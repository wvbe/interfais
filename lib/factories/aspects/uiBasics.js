var renderHelper = require('../../helpers/renderHelper');

module.exports = function(app, uiFactory) {

	//
	//
	// BASIC RENDER METHODS
	// - (Typographic) building blocks
	// - Queued for (pre) render cycles
	// - Whenever first argument is a function, this function is assumed to be a factory for the expected arguments. This way,
	//   you can rerender your queued line in another boundingbox. The function is given the context of the particular
	//   uiFactory.
	//
	//

	/**
	 *
	 * @param {String|Number}    color
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.background = function (color) {
		this._background = color;
		return this;
	};

	/**
	 *
	 * @param {String|Number}    color
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.foreground = function (color) {
		this._foreground = color;
		return this;
	};
	// For every available renderHelper, create a queue wrapper as prototype on uiFactory
	// uiFactory.prototype.
	Object.keys(renderHelper).forEach(function (renderMethod) {
		uiFactory.prototype[renderMethod] = function () {
			uiFactory.queue.apply(this, [renderHelper[renderMethod], arguments]);
			return this;
		};
	});


	//
	//
	// COMPOSITE RENDER METHODS
	// - Make use of paragraph, line, spacer and ruler
	//
	//

	/**
	 * Queue a page header for render.
	 * @param {String|Function} text
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.h1 = function (text) {
		uiFactory.queue.apply(this, [renderHelper.line, arguments, {
			underline: true,
			uppercase: true
		}]);
		this.spacer();
		return this;
	};


	uiFactory.prototype.h2 = function (text) {
		uiFactory.queue.apply(this, [renderHelper.line, arguments, {
			underline: true
		}]);
		this.spacer();
		return this;
	};



	/**
	 * Refresh at this interval while UI is visible
	 * @param {Number} milliseconds
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.interval = function (milliseconds) {
		this.interval = milliseconds || false;
		return this;
	};



};