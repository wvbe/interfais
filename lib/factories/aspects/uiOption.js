var FocusManager = require('../../managers/FocusManager');
var renderHelper = require('../../helpers/renderHelper');

module.exports = function(app, Ui) {

	/**
	 * Adds a menu item that can be "confirmed" with return.
	 * @method Ui#option
	 * @param {String} name
	 * @param {Function} callback Executed when option is selected
	 * @returns {Ui}
	 */
	Ui.prototype.option = function (name, callback) {
		var self = this,
			command;

		if (!self.isInteractive())
			Ui.makeInteractive.apply(this);

		command = new app.focusManager.FocusableObject(name);
		command.confirm = callback;

		self._menu.add(command);

		Ui.queue.apply(self, [renderHelper.line, [' ' + command.name + ' '], function () {
			return {
				invert: self._menu.getCurrent() === command
			}
		}]);

		return this;
	};
};