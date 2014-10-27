module.exports = function(app, Ui) {

	/**
	 * Wether or not this form is interactive.
	 * @method Ui#isInteractive
	 * @returns {boolean}
	 */
	Ui.prototype.isInteractive = function () {
		return !!this._menu;
	};

	/**
	 * Focus on the previous menu item. Emits the menu:shift event.
	 * @method Ui#focusPrevious
	 * @returns {Ui}
	 */
	Ui.prototype.focusPrevious = function () {
		this._menu.shift(true);
		this.emit('menu:shift', this._menu.getCurrent());
		return this;
	};

	/**
	 * Focus on the next menu item. Emits the menu:shift event.
	 * @method Ui#focusNext
	 * @returns {Ui}
	 */
	Ui.prototype.focusNext = function () {
		this._menu.shift();
		this.emit('menu:shift', this._menu.getCurrent());
		return this;
	};

	/**
	 * Confirms the focused item (input/option), meaning execute the callback that was given.
	 * Emits the menu:confirm event.
	 * @method Ui#focusConfirm
	 * @returns {Ui}
	 */
	Ui.prototype.focusConfirm = function () {
		var current = this._menu.getCurrent();
		current.confirm();
		this.emit('menu:confirm', current);
		return this;
	};
};