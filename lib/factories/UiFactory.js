var paintHelper = require('../helpers/paintHelper');

module.exports = function (app) {

	paintHelper.init();

	/**
	 * Accumulates configuration in order to render and rerender UI elements like paragraphs,
	 * lists, menu options and input fields. Also handles some basic stuff on the UI like scrolling
	 * and menu focus. Most render items take a function as an argument instead of the regular input,
	 * to enable you to inject your own logic at (pre)rendertime.
	 * @TODO Should not rerender when scroll has no effect
	 * @namespace uiFactory
	 * @example
	 *     module.exports = function(ui, viewParams) {
	 *         var name = null;
	 *         ui
	 *             .within(box)
	 *             .h1('Whats up!')
	 *             .paragraph('blabla whatever longtext wrapping etc')
	 *             .list(['blabla whatever longtext wrapping etc'])
	 *             .option('Close', function() {
	 *                 process.exit();
	 *             })
	 *             .input('Name: ', function(value) {
	 *                 name = value;
	 *                 ui.render();
	 *             })
	 *             .ruler('-')
	 *             .line(function() {
	 *                 return ['Your name is ' + (name ? name : 'a big mystery')];
	 *             })
	 *             .spacer()
	 *             .render()
	 *     };
	 *
	 * @constructor
	 */
	function uiFactory() {
		this._box = {};
		this._padding = { x: 0, y: 0 };
		this._margin = { x: 0, y: 0 };
		this._scroll = { x: 0, y: 0 }; // > 0 means scrolled down/right
		this._lines = [];
		this._queue = [];
		this._menu = null;

		this._foreground = undefined;
		this._background = undefined;
	}

	/**
	 * On creating a new UI by chaining the configuration, your renderer methods (line, paragraph, menu, h1, etc.) are
	 * queued for output, so that they can be rerun when another render cycle, with different dimensions, occurs.
	 * @memberof uiFactory
	 * @param {Function} method
	 * @param {Array.<*>} args
	 * @param {Object} formatting
	 * @param {Boolean} formatting.blink - Havent seen this work
	 * @param {Boolean} formatting.bold
	 * @param {Boolean} formatting.dim
	 * @param {Boolean} formatting.hidden - Not sure if this works
	 * @param {Boolean} formatting.invert
	 * @param {Boolean} formatting.underline
	 * @param {Boolean} formatting.uppercase
	 * @returns {_queue}
	 * @private
	 * @param formatting
	 */
	uiFactory.queue = function queueMethodForRenderTime(method, args, formatting) {
		var queuedLine = {
			method: method,
			args: args,
			formatting: formatting
		};

		this._queue.push(queuedLine);
		return this;
	};

	// Enable uiFactory with different aspects
	require('./aspects/uiBasics')(app, uiFactory);
	require('./aspects/uiEmitter')(app, uiFactory);
	require('./aspects/uiFocus')(app, uiFactory);
	require('./aspects/uiInput')(app, uiFactory);
	require('./aspects/uiOption')(app, uiFactory);
	require('./aspects/uiRender')(app, uiFactory);
	require('./aspects/uiScroll')(app, uiFactory);
	require('./aspects/uiSpacing')(app, uiFactory);
	require('./aspects/uiStream')(app, uiFactory);

	return uiFactory;
};