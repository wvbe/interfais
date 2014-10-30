

module.exports = function(app, Ui) {


	/**
	 * Listen to an event
	 * @method Ui#on
	 * @param {String} eventName
	 * @param {Function} listener
	 * @returns {Ui}
	 */
	Ui.prototype.on = function (eventName, listener) {
		this._emitter.on.apply(this._emitter, arguments);
		return this;
	};

	Ui.prototype.once = function (eventName, listener) {
		this._emitter.once.apply(this._emitter, arguments);
		return this;
	};

	/**
	 * No longer listen for an event. Equivelant to removeAllListeners() on a regular eventEmitter.
	 * @method Ui#off
	 * @param {String} [eventName]
	 * @paramt {Function} [listener]
	 * @returns {Ui}
	 */
	Ui.prototype.off = function (eventName, listener) {
		this._emitter.removeAllListeners.apply(this._emitter, arguments);
		return this;
	};

	/**
	 * @method Ui#emit
	 * @param {String} eventName
	 * @param {*} [data]
	 * @returns {Ui}
	 */
	Ui.prototype.emit = function (eventName, data) {
		this._emitter.emit.apply(this._emitter, arguments);
		return this;
	};
};