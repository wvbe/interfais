var paintHelper = require('../helpers/paintHelper'),
	FocusManager = require('../managers/FocusManager'),
	EventEmitter = require('events').EventEmitter;

module.exports = function UiFactory (app) {

	paintHelper.init();

	/**
	 * Accumulates configuration in order to render and rerender UI elements like paragraphs,
	 * lists, menu options and fork fields. Also handles some basic stuff on the UI like scrolling
	 * and menu focus. Most render items take a function as an argument instead of the regular fork,
	 * to enable you to inject your own logic at (pre)rendertime.
	 * @TODO Should not rerender when scroll has no effect
	 * @class Ui
	 * @example
	 *     module.exports = function MyFirstView (ui, viewParams) {
	 *         var name = null;
	 *         ui
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
	 *             .spacer();
	 *     };
	 */
	function Ui () {
		this._background = null;
		this._foreground = null;
		this._box = {};
		this._emitter = new EventEmitter();
		this._padding = { x: 0, y: 0 };
		this._margin = { x: 0, y: 0 };
		this._scroll = { x: 0, y: 0 }; // > 0 means scrolled down/right
		this._queue = [];
		this._menu = null;

	}

	/**
	 * On creating a new UI by chaining the configuration, your renderer methods (line, paragraph, menu, h1, etc.) are
	 * queued for output, so that they can be rerun when another render cycle, with different dimensions, occurs.
	 * @method Ui.queue
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
	 * @param formatting
	 * @returns {_queue}
	 */
	Ui.queue = function queueMethodForRenderTime (method, args, formatting) {
		var queuedLine = {
			method: method,
			args: args,
			formatting: formatting
		};

		this._queue.push(queuedLine);

		return this;
	};

	Ui.makeInteractive = function makeFocusableMenu() {
		var $this = this;

		if ($this._menu)
			return;

		$this._menu = new FocusManager(app);

		$this.on('focus', function() {
			$this._menu.init({
				keyNext: 'menuNext',
				keyPrevious: 'menuPrevious',
				keyConfirm: 'menuConfirm'
			}, function () {
				$this.render();
			});
		});

		$this.on('blur', function() {
			$this._menu.destroy();
		});
		$this.on('close', function() {
			$this._menu.destroy();
		});

	};

	/*
	 Enable Ui with different aspects, which are at this time pretty coarse parts of what the ui object
	 lets you configurates. It largely dictates how UI behaves (which is bad, should be more OO).
	 @TODO: Should be more object oriented
	 @TODO: Rely more on the uiEmitter for state changes, so that render color & focusness etc. can be more modular
	        and old code can be deleted
	 */


	require('./aspects/uiBasics')(app, Ui);
	require('./aspects/uiEmitter')(app, Ui);
	require('./aspects/uiFocus')(app, Ui);
	require('./aspects/uiInput')(app, Ui);
	require('./aspects/uiOption')(app, Ui);
	require('./aspects/uiRender')(app, Ui);
	require('./aspects/uiScroll')(app, Ui);
	require('./aspects/uiSpacing')(app, Ui);
	require('./aspects/uiStream')(app, Ui);

	return Ui;
};