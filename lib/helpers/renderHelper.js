var wordwrap = require('wordwrap'),
	stringHelper = require('./stringHelper');

/**
 * Render functions that may be queued with their respective arguments.
 *
 * All prerenderers return an array of strings that are already wrapped and colorized, so that they can be rerendered easily.
 *
 * All prerenderers have the uiFactory context.
 *
 * @todo not strictly helper functions because they assume to have a certain context!
 */
var prerender = {

	/**
	 * Fills a line with emptyness.
	 * @returns {Array}
	 */
	spacer: function () {
		return [undefined];
	},

	/**
	 * Fills a line by repeating given char.
	 * @param {String} char
	 * @returns {Array}
	 */
	ruler: function (char) {
		return [stringHelper.fill(this.getContentWidth(), char)];
	},
	/**
	 * One line that is clipped to content width if neccessary
	 * @param {String|Array.<String>} lines
	 */
	line: function (lines) {
		if (!(typeof lines === 'object' && lines.length))
			lines = [lines];

		var width = this.getContentWidth();
		return lines.map(function (line) {
			if (!line)
				return '$ invalid line';
			return line.substr(0, width)
		});
	},

	/**
	 * @param {String|Array.<String>} text
	 * @returns {Array}
	 */
	keyValue: function (pairs, options) {
		if(typeof pairs === 'object' && typeof pairs.forEach !== 'function')
			pairs = Object.keys(pairs).map(function(keyName) {
				return {
					key: keyName,
					value: pairs[keyName]
				};
			});

		if(!pairs || !pairs.length)
			return null;

		return null;
		var keyWidth = options.keyWidth || pairs.reduce(function(maxLength, pair) {
				if(pair.key.length > maxLength)
					return pair.key.length;
				return maxLength;
			}, 0);

		if (!(typeof text === 'object' && text.length))
			text = [text];

		text = text.reduce(function (previousValue, currentValue) {
			var listItemLines = (typeof currentValue === 'string' || typeof currentValue === 'number')
				? wordwrap(0, width, { mode: 'hard' })('' + currentValue).split('\n')
				: currentValue;

			return previousValue.concat(listItemLines.map(function (line, i) {
				return stringHelper.fill(indent * indentWidth) + (i === 0 ? stringHelper.format(indentCharFormatting, indentChar) : stringHelper.fill(indentWidth)) + line;
			}));
		}, []);

		return text;
	},

	/**
	 * @param {String|Array.<String>} text
	 * @returns {Array}
	 */
	list: function (text) {
		var indent = 0,
			indentChar = '  >  ',
			indentWidth = indentChar.length,
			indentCharFormatting = {
				dim: true
			},
			width = this.getContentWidth() - (indent + 1) * indentWidth;

		if (!(typeof text === 'object' && text.length))
			text = [text];

		text = text.reduce(function (previousValue, currentValue) {
			var listItemLines = (typeof currentValue === 'string' || typeof currentValue === 'number')
				? wordwrap(0, width, { mode: 'hard' })('' + currentValue).split('\n')
				: currentValue;

			return previousValue.concat(listItemLines.map(function (line, i) {
				return stringHelper.fill(indent * indentWidth) + (i === 0 ? stringHelper.format(indentCharFormatting, indentChar) : stringHelper.fill(indentWidth)) + line;
			}));
		}, []);

		return text;
	},

	/**
	 * One or more lines that wrap
	 * @param {String|Array.<String>} text
	 * @returns {Array}
	 * @param formatting
	 */
	paragraph: function (text, formatting) {
		var width = this.getContentWidth();

		if (!(typeof text === 'object' && text.length))
			text = [text];

		text = text.reduce(function (previousValue, currentValue) {
			return previousValue.concat(
				(typeof currentValue === 'string' || typeof currentValue === 'number')
					? stringHelper.format(formatting || {}, wordwrap(0, width, { mode: 'hard' })('' + currentValue)).split('\n')
					: currentValue
			);
		}, []);

		return text;
	}
};


module.exports = prerender;
