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