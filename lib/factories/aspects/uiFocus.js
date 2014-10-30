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
	 * Confirms the focused item (input/option), meaning execute the callback that was given.
	 * @method Ui#focusConfirm
	 * @returns {Ui}
	 */
	Ui.prototype.focusConfirm = function () {
		var current = this._menu.getCurrent();
		current.confirm();
		return this;
	};
};