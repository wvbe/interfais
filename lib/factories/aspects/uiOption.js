var FocusableObject = require('../../classes/FocusableObject');
var EventEmitter = require('events').EventEmitter;

var paintHelper = require('../../helpers/paintHelper');
var stringHelper = require('../../helpers/stringHelper');
var renderHelper = require('../../helpers/renderHelper');

var FocusManager = require('../../managers/FocusManager');

module.exports = function(app, uiFactory) {

	/**
	 * Adds a menu item. Accepts Command objects or name/callback
	 * @param {String} name
	 * @param {Function} callback Executed when option is selected
	 * @returns {uiFactory}
	 */
	uiFactory.prototype.option = function (name, callback) {
		var self = this,
			command;

		if (!self._menu)
			self._menu = new FocusManager();

		command = new FocusableObject(name);
		command.confirm = callback;

		self._menu.addView(command);

		uiFactory.queue.apply(self, [renderHelper.line, [' ' + command.name + ' '], function () {
			return {
				invert: self._menu.getCurrent() === command
			}
		}]);

		return this;
	};


};