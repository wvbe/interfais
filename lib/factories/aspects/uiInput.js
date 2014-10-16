var FocusableObject = require('../../classes/FocusableObject');
var EventEmitter = require('events').EventEmitter;

var paintHelper = require('../../helpers/paintHelper');
var stringHelper = require('../../helpers/stringHelper');
var renderHelper = require('../../helpers/renderHelper');

var FocusManager = require('../../managers/FocusManager');

module.exports = function(app, uiFactory) {

	/**
	 * Maintain an input field that takes input when "focused"
	 * @param {String|Function} [name] Field label or label generator
	 * @param {Function} callback Success callback, gets value as argument
	 * @param {Object} options
	 * @param {Object} options.hidden True if value is sensitive and should only be rendered with asterixes
	 * @param {Object} options.clear @TODO True if should be cleared on confirm
	 * @todo Current "hidden" option may be renamed to "obscured" to make room for a real "hidden", aka do not display anything
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.input = function (name, callback, options) {
		var self = this;

		if (!callback || typeof callback === 'object') {
			options = callback;
			callback = name;
			name = null;
		}

		options = options || {};

		if (!self._menu)
			self._menu = new FocusManager();

		var command = new FocusableObject(name),
			emitter = null,
			value = '',
			cursor = value.length,
			focused = false;

		command.focus = function () {
			focused = true;
			emitter = app.inputManager.input();
			emitter.on('*', onCharacter);
			emitter.on('backspace', onBackspace);
			emitter.on('delete', onDelete);
			emitter.on('left', onLeft);
			emitter.on('right', onRight);
			emitter.on('home', onHome);
			emitter.on('end', onEnd);
			emitter.on('return', onReturn);
		};

		command.blur = function () {
			focused = false;
			if (emitter)
				emitter.destroy();

			self.render();
		};

		self._menu.addView(command);

		uiFactory.queue.apply(self, [renderHelper.line, [function () {
			var n = command.name;

			var rendered = (options.hidden ? stringHelper.fill(value.length, '*') : value);
			// @TODO: Clip string to available width *here*
			var underlinedCharacter = rendered.slice(cursor, cursor + 1);

			if (focused)
				rendered = rendered.slice(0, cursor) + (stringHelper.format({underline: true}, underlinedCharacter || ' ')) + rendered.slice(cursor + 1, rendered.length);

			return [
				[' ' + (n || '') + rendered + (underlinedCharacter ? '  ' : ' ')]
			]

		}], function () {
			return {
				invert: self._menu.getCurrent() === command
			}
		}]);

		function onCharacter(key) {
			value = value.slice(0, cursor) + key.sequence + value.slice(cursor, value.length);
			++cursor;
			self.render();
		}

		function onBackspace() {
			if (cursor < 1)
				return;
			value = value.slice(0, cursor - 1) + value.slice(cursor, value.length);
			--cursor;
			self.render();
		}

		function onDelete() {
			if (cursor >= value.length)
				return;
			value = value.slice(0, cursor) + value.slice(cursor + 1, value.length);
			self.render();
		}

		function onLeft() {
			if (cursor > 0)
				--cursor;
			self.render();
		}

		function onRight() {
			if (cursor < value.length)
				++cursor;
			self.render();
		}

		function onHome() {
			cursor = 0;
			self.render();
		}

		function onEnd() {
			cursor = value.length;
			self.render();
		}

		function onReturn() {
			callback(value);

		}

		return this;
	};


};