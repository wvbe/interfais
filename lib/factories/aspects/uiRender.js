var paintHelper = require('../../helpers/paintHelper');
var stringHelper = require('../../helpers/stringHelper');

module.exports = function(app, Ui) {

	Ui.prototype._lines = [];

	/**
	 * Makeshift function to clear the space available to this UI. Useful for thorough redraws.
	 * @method Ui#clear
	 * @returns {Ui}
	 */
	Ui.prototype.clear = function() {
		paintHelper.renderRectangle(this._box);
		return this;
	};

	/**
	 * Render everything.
	 * @method Ui#render
	 * @returns {Ui}
	 */
	Ui.prototype.render = function () {
		// @TODO: Not _prerender on every render
		_prerender.apply(this);

		_render.apply(this);

		return this;
	};
};

function intInBetween(int, min, max) {
	if (min !== undefined && int < min)
		int = min;
	if (max !== undefined && int > max)
		int = max;
	return int;
}

/*
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
		var renderHelperOutput = (queuedLine.method.apply(self, args) || [])

			// And run map on output (or an empty array)
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

		if(renderHelperOutput.length)
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

/*
 * At render time the margin, padding and prerendered lines are sent to the output stream, stdout.
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

/*
 * Render line y with string, taking into account padding and margin. Needs Ui's context.
 * @param y
 * @param lineString
 */
function _renderLine(y, lineString) {

	if (y >= this._box.height - this._prerendered.margin.top) {
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
	}, line.join(''));

	// I would love to truncate to horizontal bounds, but unfortunately string.length would
	// be unreliable due to formatting characters. We need a String that does not count
	// formatting in it's .length property
}