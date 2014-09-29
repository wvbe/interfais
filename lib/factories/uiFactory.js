var Command = require('../classes/Command');

var paintHelper = require('../helpers/paintHelper'),
	stringHelper = require('../helpers/stringHelper'),
	renderHelper = require('../helpers/renderHelper');

var BOX_DEFAULTS = {
	width: 120,
	height: 60,
	x: 0,
	y: 0
};

module.exports = uiFactory;

/**
 * Every method returns the configuration chain, except for the last one (@todo)
 * @todo factor out the boundingBox argument and instead require 'within()'
 *
 * @example
 *     new uiFactory()
 *     	   .within(box)
 *         .h1('Whats up!')
 *         .paragraph(['blabla whatever longtext wrapping etc', 'aefsrgdth'])
 *         // .list(['blabla whatever longtext wrapping etc']) // Not implemented
 *         .menu([new Command('Yarrrr!').makeExecutable(deathRay)])
 *         //.table // Not for some time
 *         .ruler('-')
 *         .spacer()
 *         .render()
 *
 * @constructor
 */
function uiFactory(boundingBox) {
	this._box = boundingBox || {};
	this._padding = { x: 0, y: 0 };
	this._margin = { x: 0, y: 0 };
	this._lines = [];
	this._queue = [];
	this._menu = null; // Would be a "root" Command with subcommands as menu items
}


/**
 * Currently renders everything within the margin by iterating over the seperate _lines.
 */
uiFactory.prototype.render = function () {
	// @TODO: Not _prerender on every render
	_prerender.apply(this);

	_render.apply(this);

	return this;
};

uiFactory.prototype.getContentWidth = function () {
	return this._box.width - 2 * this._margin.x - 2 * this._padding.x;
};


/**
 * Define the boundingBox of renderings to come.
 * @todo maybe autodetect screensize? in-case-of-no-config
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
 * @param milliseconds
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
		_queue.apply(this, [renderHelper[renderMethod], arguments]);
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
 * Add a menu item
 * @param {Command} command
 * @returns {uiFactory}
 */
uiFactory.prototype.h1 = function (text) {
	_queue.apply(this, [renderHelper.line, arguments, {
		underline: true,
		uppercase: true
	}]);
	this.spacer();
	return this;
};

/**
 * Queue a page header for render.
 * @param {String|Array.<String>} text
 * @returns {uiFactory}
 */
uiFactory.prototype.h1 = function (text) {
	_queue.apply(this, [renderHelper.line, arguments, {
		underline: true,
		uppercase: true
	}]);
	this.spacer();
	return this;
};
uiFactory.prototype.h2 = function (text) {
	_queue.apply(this, [renderHelper.line, arguments, {
		underline: true
	}]);
	this.spacer();
	return this;
};


/**
 * Adds a menu item. Accepts Command objects or name/callback
 * @param {String|Command} name
 * @param {Function} callback Executed when option is selected
 */
uiFactory.prototype.option = function(name, callback) {
	var self = this,
		command;

	if (!self._menu)
		self._menu = new Command('root');

	if(name instanceof Command)
		command = name;
	else
		command = new Command(name).makeExecutable(callback);

	// Set initial focus if is first child
	if (!self._menu.getChildren().length)
		self._focused = command;

	self._menu.addChild(command);

	_queue.apply(self, [renderHelper.line, [' ' + command.toString() + ' '], function () {
		return {
			invert: self._focused === command
		}
	}]);

	return this;
};


uiFactory.prototype.focusPrevious = function () {
	var generation = this._menu.getChildren(),
		focusIndex = generation.indexOf(this._focused),
		newFocusIndex = focusIndex === 0 ? generation.length - 1 : --focusIndex;
	this._focused = generation[newFocusIndex];
};
uiFactory.prototype.focusNext = function () {
	var generation = this._menu.getChildren(),
		focusIndex = generation.indexOf(this._focused),
		newFocusIndex = focusIndex === generation.length - 1 ? 0 : ++focusIndex;
	this._focused = generation[newFocusIndex];
};
uiFactory.prototype.selectFocused = function () {
	if (this._focused.isExecutable())
		this._focused.execute();
};
uiFactory.prototype.isInteractive = function () {
	return this._menu instanceof Command;
};

//
//
// PROTECTED METHODS
// - Have the uiFactory context but are not exposed.
//
//


/**
 * On creating a new UI by chaining the configuration, your renderer methods (line, paragraph, menu, h1, etc.) are
 * queued for output, so that they can be rerun when another render cycle, with different dimensions, occurs.
 * @TODO: consider exposing this as a method
 * @param method
 * @param args
 * @returns {_queue}
 * @private
 */
function _queue(method, args, formatting) {
	var queuedLine = {
		method: method,
		args: args,
		formatting: formatting
	};

	this._queue.push(queuedLine);
	return this;
}


/**
 * At prerender time al queued formatting method calls are executed. The result of this is an array of strings that
 * each represent a line to be drawn (as opposed to one queued item, like a multi-line paragraph). It also formats the
 * strings with bold, underline, invert, etc. Because of the formatting tokens, a line string can be longer than it is
 * actually rendered
 * @returns {_prerender}
 * @private
 */
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
	if (self._padding.y)
		for (var i = linesRendered; i < self._padding.y; i++) {
			_renderLine.apply(self, [linesRendered, '']);
			++linesRendered;
		}

	// Contents
	lineStrings.forEach(function (lineString, y) {
		_renderLine.apply(self, [
			linesRendered,
			lineString
		]);
		++linesRendered;
	});

	// Bottom padding
	if (self._padding.y)
		for (
			var j = 0;
			j < self._padding.y;
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

	if (y > this._box.height - this._padding.y - 2 * this._margin.y) {
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
		y: this._box.y + this._margin.y + y
	}, line.join('')); // I would love to truncate to horizontal bounds, but unfortunately string.length would
	                   // give false negatives due to formatting characters
}