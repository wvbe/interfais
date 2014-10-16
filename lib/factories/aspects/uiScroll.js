var FocusableObject = require('../../classes/FocusableObject');
var EventEmitter = require('events').EventEmitter;

var paintHelper = require('../../helpers/paintHelper');
var stringHelper = require('../../helpers/stringHelper');
var renderHelper = require('../../helpers/renderHelper');

var FocusManager = require('../../managers/FocusManager');

module.exports = function(app, uiFactory) {

	/**
	 * Offset the content to scroll down one line.
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.scrollDown = function () {
		if (this._box.height + this._scroll.y < this._lines.length + 2 * this._margin.y + 2 * this._padding.y)
			++this._scroll.y;
		this.clear();
		return this;
	};

	/**
	 * Offset the content to scroll up one line.
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.scrollUp = function () {
		if (this._scroll.y > 0)
			--this._scroll.y;

		this.clear();
		return this;
	};

};