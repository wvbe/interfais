module.exports = function(app, Ui) {

	/**
	 * Offset the content to scroll down one line.
	 * @method Ui#scrollDown
	 * @returns {Ui}
	 */
	Ui.prototype.scrollDown = function () {
		if (this._box.height + this._scroll.y < this._lines.length + 2 * this._margin.y + 2 * this._padding.y)
			++this._scroll.y;
		this.clear();
		return this;
	};

	/**
	 * Offset the content to scroll up one line.
	 * @method Ui#scrollUp
	 * @returns {Ui}
	 */
	Ui.prototype.scrollUp = function () {
		if (this._scroll.y > 0)
			--this._scroll.y;

		this.clear();
		return this;
	};

};