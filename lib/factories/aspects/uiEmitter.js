var EventEmitter = require('events').EventEmitter;

module.exports = function(app, Ui) {

	var emitter = new EventEmitter();

	/**
	 * Listen to an event
	 * @method Ui#on
	 * @param {String} eventName
	 * @param {Function} listener
	 * @returns {Ui}
	 */
	Ui.prototype.on = function (eventName, listener) {
		emitter.on.apply(emitter, arguments);
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
		emitter.removeAllListeners.apply(emitter, arguments);
		return this;
	};

	/**
	 * @method Ui#emit
	 * @param {String} eventName
	 * @param {*} [data]
	 * @returns {Ui}
	 */
	Ui.prototype.emit = function (eventName, data) {
		emitter.emit.apply(emitter, arguments);
		return this;
	};
};