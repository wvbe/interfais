var FocusManager = require('../../managers/FocusManager');
var FocusableObject = require('../../classes/FocusableObject');
var renderHelper = require('../../helpers/renderHelper');

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