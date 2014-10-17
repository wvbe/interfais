var EventEmitter = require('events').EventEmitter;

module.exports = function(app, uiFactory) {

	var emitter = new EventEmitter();

	/**
	 * Listen to an event
	 * @param {String} eventName
	 * @param {Function} listener
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.on = function (eventName, listener) {
		emitter.on.apply(emitter, arguments);
		return this;
	};
	
	/**
	 * No longer listen for an event. Equivelant to removeAllListeners() on a regular eventEmitter.
	 * @param {String} [eventName]
	 * @paramt {Function} [listener]
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.off = function (eventName, listener) {
		emitter.removeAllListeners.apply(emitter, arguments);
		return this;
	};

	/**
	 *
	 * @param {String} eventName
	 * @param {*} [data]
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.emit = function (eventName, data) {
		emitter.emit.apply(emitter, arguments);
		return this;
	};
};