var FocusManager = require('../../managers/FocusManager');
var FocusableObject = require('../../classes/FocusableObject');
var renderHelper = require('../../helpers/renderHelper');

module.exports = function(app, uiFactory) {


	/**
	 * Wether or not this form is interactive.
	 * @returns {boolean}
	 */
	uiFactory.prototype.isInteractive = function () {
		return !!this._menu;
	};

	/**
	 * Focus on the previous menu item. Emits the menu:shift event.
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.focusPrevious = function () {
		this._menu.shift(true);
		this.emit('menu:shift', this._menu.getCurrent());
		return this;
	};

	/**
	 * Focus on the next menu item. Emits the menu:shift event.
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.focusNext = function () {
		this._menu.shift();
		this.emit('menu:shift', this._menu.getCurrent());
		return this;
	};

	/**
	 * @TODO: Deprecate, is currently noop
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.resetFocus = function () {
		//this._menu.select(0);
		return this;
	};

	/**
	 * Confirms the focused item (input/option), meaning execute their shit.
	 * Emits the menu:confirm event.
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.selectFocused = function () {
		var current = this._menu.getCurrent();
		current.confirm();
		this.emit('menu:confirm', current);
		return this;
	};

};