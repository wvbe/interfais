var renderHelper = require('../../helpers/renderHelper');

module.exports = function(app, Ui) {

	/**
	 * Write everything from a stdout/pipe to wrapping text in this ui. The argument callback receives two functions
	 * meant for accumulating stdout and stderr output (or whatever you choose to put there). UI updates and renders
	 * itself whenever either of two is called.
	 * @method Ui#stream
	 * @param {Function} configurator
	 * @returns {Ui}
	 */
	Ui.prototype.stream = function (configurator) {
		var self = this;
		var childProcessLines = [];

		function dataListener(data) {
			data.split('\n').forEach(function(line) {
				if(line)
					childProcessLines.push({ type: 'data', data: '  ' + line });
			});

			self.render();
		}

		function errorListener(data) {
			data.split('\n').forEach(function(line) {
				if(line)
					childProcessLines.push({ type: 'data', data: '> ' + line });
			});

			self.render();
		}

		configurator(dataListener, errorListener);

		Ui.queue.apply(self, [renderHelper.paragraph, [function () {
			return [
				childProcessLines.map(function(msg) { return msg.data })
			]
		}]]);

		return this;
	};
};