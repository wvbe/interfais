var FocusableObject = require('../classes/FocusableObject'),
	EventEmitter = require('events').EventEmitter;

var paintHelper = require('../helpers/paintHelper'),
	stringHelper = require('../helpers/stringHelper'),
	renderHelper = require('../helpers/renderHelper');

var FocusManager = require('../managers/FocusManager');

var BOX_DEFAULTS = {
	width: 120,
	height: 60,
	x: 0,
	y: 0
};

module.exports = function (app) {

	paintHelper.init();

	/**
	 * Accumulates configuration in order to render and rerender UI elements like paragraphs,
	 * lists, menu options and input fields. Also handles some basic stuff on the UI like scrolling
	 * and menu focus. Most render items take a function as an argument instead of the regular input,
	 * to enable you to inject your own logic at (pre)rendertime.
	 * @TODO Should not rerender when scroll has no effect
	 * @class uiFactory
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
		this._emitter = new EventEmitter();

		this._foreground = undefined;
		this._background = undefined;
	}

	/**
	 * On creating a new UI by chaining the configuration, your renderer methods (line, paragraph, menu, h1, etc.) are
	 * queued for output, so that they can be rerun when another render cycle, with different dimensions, occurs.
	 * @TODO: consider exposing this as a method
	 * @param method
	 * @param args
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

	function patchUiWithAspect(aspectFile) {
		aspectFile(app, uiFactory);
	}

	patchUiWithAspect(require('./aspects/uiBasics'));
	patchUiWithAspect(require('./aspects/uiEmitter'));
	patchUiWithAspect(require('./aspects/uiInput'));
	patchUiWithAspect(require('./aspects/uiOption'));
	patchUiWithAspect(require('./aspects/uiScroll'));
	patchUiWithAspect(require('./aspects/uiSpacing'));
	patchUiWithAspect(require('./aspects/uiStream'));

	/**
	 * Listen to an event
	 * @param {String} eventName
	 * @param {Function} listener
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.on = function (eventName, listener) {
		this._emitter.on.apply(this._emitter, arguments);
		return this;
	};
	/**
	 * No longer listen for an event. Equivelant to removeAllListeners() on a regular eventEmitter.
	 * @param {String} [eventName]
	 * @paramt {Function} [listener]
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.off = function (eventName, listener) {
		this._emitter.removeAllListeners.apply(this._emitter, arguments);
		return this;
	};

	/**
	 *
	 * @param {String} eventName
	 * @param {*} [data]
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.emit = function (eventName, data) {
		this._emitter.emit.apply(this._emitter, arguments);
		return this;
	};

	/**
	 * Makeshift function to clear the space available to this UI. Useful for thorough redraws.
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.clear = function() {
		paintHelper.renderRectangle(this._box);
		return this;
	};



	/**
	 * Render everything.
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.render = function () {
		// @TODO: Not _prerender on every render
		_prerender.apply(this);

		_render.apply(this);

		return this;
	};

	/**
	 * Get the available width for ASCII content, in columns.
	 * @returns {number}
	 */
	uiFactory.prototype.getContentWidth = function () {
		return this._box.width - 2 * this._margin.x - 2 * this._padding.x;
	};


	/**
	 * Define the boundingBox of renderings to come.
	 * @param {Number|Object}    width      width in number of columns, or the entire _box variable. Should not be < 1.
	 * @param {Number}          [height]    Should not be < 1.
	 * @param {Number}          [x]
	 * @param {Number}          [y]
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.within = function (width, height, x, y) {
		if (typeof width === 'object') {
			var self = this;
			Object.keys(BOX_DEFAULTS).forEach(function (dimension) {
				self._box[dimension] = width[dimension] || BOX_DEFAULTS[dimension];
			});
		} else {

			this._box = {
				width: width || BOX_DEFAULTS.width,
				height: height || BOX_DEFAULTS.height,
				x: x || BOX_DEFAULTS.x,
				y: y || BOX_DEFAULTS.y
			};
		}

		this.clear();

		return this;
	};

	/**
	 * Add padding to the eventual output, space between the background and ascii content.
	 * @param {Number}    vertical        In rows.
	 * @param {Number}    [horizontal]    In columns
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.padding = function (vertical, horizontal) {

		if (horizontal == undefined)
			horizontal = vertical;

		this._padding = {
			x: horizontal,
			y: vertical
		};

		return this;
	};

	/**
	 * Add margin to the eventual output, space between the background and boundingbox.
	 * @param {Number}    vertical        In rows.
	 * @param {Number}    [horizontal]    In columns
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.margin = function (vertical, horizontal) {

		if (horizontal == undefined)
			horizontal = vertical;

		this._margin = {
			x: horizontal,
			y: vertical
		};

		return this;
	};

	/**
	 *
	 * @param {String|Number}    color
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.background = function (color) {
		this._background = color;
		return this;
	};

	/**
	 *
	 * @param {String|Number}    color
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.foreground = function (color) {
		this._foreground = color;
		return this;
	};

	/**
	 * Refresh at this interval while UI is visible
	 * @param {Number} milliseconds
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.interval = function (milliseconds) {
		this.interval = milliseconds || false;
		return this;
	};


	//
	//
	// BASIC RENDER METHODS
	// - (Typographic) building blocks
	// - Queued for (pre) render cycles
	// - Whenever first argument is a function, this function is assumed to be a factory for the expected arguments. This way,
	//   you can rerender your queued line in another boundingbox. The function is given the context of the particular
	//   uiFactory.
	//
	//

	// For every available renderHelper, create a queue wrapper as prototype on uiFactory
	// uiFactory.prototype.
	Object.keys(renderHelper).forEach(function (renderMethod) {
		uiFactory.prototype[renderMethod] = function () {
			uiFactory.queue.apply(this, [renderHelper[renderMethod], arguments]);
			return this;
		};
	});


	//
	//
	// COMPOSITE RENDER METHODS
	// - Make use of paragraph, line, spacer and ruler
	//
	//

	/**
	 * Queue a page header for render.
	 * @param {String|Function} text
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.h1 = function (text) {
		uiFactory.queue.apply(this, [renderHelper.line, arguments, {
			underline: true,
			uppercase: true
		}]);
		this.spacer();
		return this;
	};


	uiFactory.prototype.h2 = function (text) {
		uiFactory.queue.apply(this, [renderHelper.line, arguments, {
			underline: true
		}]);
		this.spacer();
		return this;
	};



	/**
	 * Focus on the previous menu item. Emits the menu:shift event.
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.focusPrevious = function () {
		this._menu.shift(true);
		this._emitter.emit('menu:shift', this._menu.getCurrent());
		return this;
	};

	/**
	 * Focus on the next menu item. Emits the menu:shift event.
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.focusNext = function () {
		this._menu.shift();
		this._emitter.emit('menu:shift', this._menu.getCurrent());
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
		this._emitter.emit('menu:confirm', current);
		return this;
	};

	/**
	 * Wether or not this form is interactive.
	 * @returns {boolean}
	 */
	uiFactory.prototype.isInteractive = function () {
		return !!this._menu;
	};

	return uiFactory;
};

//
//
// PROTECTED METHODS
// - Have the uiFactory context but are not exposed.
//
//




/**
 * At prerender time al queued formatting method calls are executed. The result of this is an array of strings that
 * each represent a line to be drawn (as opposed to one queued item, like a multi-line paragraph). It also formats the
 * strings with bold, underline, invert, etc. Because of the formatting tokens, a line string can be longer than it is
 * actually rendered
 * @returns {_prerender}
 * @private
 */

function intInBetween(int, min, max) {
	if (min !== undefined && int < min)
		int = min;
	if (max !== undefined && int > max)
		int = max;
	return int;
}
function _prerender() {
	var self = this;
	self._lines = [];

	// For every queued UI element
	self._queue.forEach(function (queuedLine) {
		var args = queuedLine.args;
		if (typeof args[0] === 'function') {
			args = args[0].apply(self);
		}

		// Call the given method/renderer
		var renderHelperOutput = queuedLine.method
			.apply(self, args)

			// Expect an of line objects
			.map(function (lineString) {
				var lineStringSuffix = self.getContentWidth() - (lineString ? lineString.length : 0),
					formatting;

				// Allow render-time formatting, or hardcoded
				if (typeof queuedLine.formatting === 'function')
					formatting = queuedLine.formatting();
				else
					formatting = queuedLine.formatting || {};

				formatting.text = lineString || '';

				// Apply formatting to text
				lineString = stringHelper.format(formatting);

				// Draw till end of line
				if (lineStringSuffix > 0)
					lineString += stringHelper.fill(lineStringSuffix);

				return lineString;
			});

		// Append all prerendered lines to the array
		self._lines = self._lines.concat(renderHelperOutput);
	});

	var scroll = this._scroll;
	var margins = {
		top: intInBetween(self._margin.y - scroll.y, 0, self._margin.y)

	};
	var paddings = {
		top: self._padding.y + intInBetween(self._margin.y - scroll.y, -self._padding.y, 0)
	};
	var clipping = {
		top: intInBetween(-(self._margin.y + self._padding.y) + scroll.y, 0)
	};

	clipping.bottom = intInBetween(clipping.top + (self._box.height - margins.top - paddings.top), 0, self._lines.length); // viewport offset + viewport height
	paddings.bottom = intInBetween(self._box.height - paddings.top - margins.top - (clipping.bottom - clipping.top), 0, self._padding.y); // might be a mistake here
	// Margin bottom is not drawn or taken into account for anything

	self._prerendered = {
		margin: margins,
		padding: paddings,
		clipping: clipping
	};


	return this;
}

/**
 * At render time the margin, padding and prerendered lines are sent to the output stream, stdout.
 * @private
 */
function _render() {
	var self = this;

	var lineStrings = self._lines,
		linesRendered = 0;
	paintHelper.resetColors();
	paintHelper.setBackground(self._background);
	paintHelper.setForeground(self._foreground);

	// Top padding
	if (self._prerendered.padding.top)
		for (var i = linesRendered; i < self._prerendered.padding.top; i++) {
			_renderLine.apply(self, [linesRendered, '']);
			++linesRendered;
		}

	// Contents
	lineStrings.slice(self._prerendered.clipping.top, self._prerendered.clipping.bottom).forEach(function (lineString, y) {
		_renderLine.apply(self, [
			linesRendered,
			lineString
		]);
		++linesRendered;
	});

	// Bottom padding
	if (self._prerendered.padding.bottom)
		for (
			var j = 0;
			j < self._prerendered.padding.bottom;
			j++
			) {
			_renderLine.apply(self, [linesRendered, '']);
			++linesRendered;
		}
}

/**
 * Render line y with string, taking into account padding and margin. Needs uiFactory's context.
 * @param y
 * @param lineString
 */
function _renderLine(y, lineString) {

	if (y > this._box.height - this._prerendered.margin.top - 1) {
		// Make sure not to draw outside of vertical bounds
		return;
	}

	var line = [];

	// Left padding
	line.push(stringHelper.fill(this._padding.x));

	// Formatted content (formatting is done at _prerender time
	line.push(lineString || stringHelper.fill(this.getContentWidth()));

	// Right padding
	line.push(stringHelper.fill(this._padding.x));

	paintHelper.renderLine({
		x: this._box.x + this._margin.x,
		y: this._box.y + this._prerendered.margin.top + y
		//y: this._box.y + this._margin.y + y
	}, line.join('')); // I would love to truncate to horizontal bounds, but unfortunately string.length would
	// give false negatives due to formatting characters
}