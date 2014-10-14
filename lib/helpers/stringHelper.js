module.exports = {
	fill: fillerString,
	format: addFormattingToLine,
	resize: stringResize
};

var FORMATTING_FLAGS = {
	blink:     ['\x1b[5m', '\x1b[25m'],
	bold:      ['\x1b[1m', '\x1b[21m'],
	dim:       ['\x1b[2m', '\x1b[22m'],
	hidden:    ['\x1b[8m', '\x1b[28m'],
	invert:    ['\x1b[7m', '\x1b[27m'],
	underline: ['\x1b[4m', '\x1b[24m']
};

/**
 * Repeats char untill length is reached or exceeded, and returns the trimmed string.
 * @param length
 * @param char
 * @returns {string}
 */
function fillerString(length, char) {
	if (!char)
		char = ' ';

	var string = '';

	while (string.length < length)
		string = string + char;

	return string.substr(0, length);
}

/**
 * Applies the formatting codes that come with the FORMATTING_FLAGS. This is the last time one can trust line.length
 * @param options
 * @returns {string}
 * @param text
 */
function addFormattingToLine(options, text) {
	var str = '';

	Object.keys(FORMATTING_FLAGS).forEach(function (formattingFlag) {
		if (!options[formattingFlag])
			return;
		str = str + FORMATTING_FLAGS[formattingFlag][0];
	});

	if(!text)
		text = options.text;

	if (options.uppercase)
		text = text.toUpperCase();

	str = str + text;

	Object.keys(FORMATTING_FLAGS).reverse().forEach(function (formattingFlag) {
		if (!options[formattingFlag])
			return;
		str = str + FORMATTING_FLAGS[formattingFlag][1];
	});

	return str;
}


/**
 * Resizes a string to a given size. Initially acts as a string padder, but
 * if padding=false it will clip. Can also do both and align text all the while.
 * @function stringResize
 * @memberof Logger~
 * @param {String} string
 * @param {Number} length The ideal new string length. Defaults to 16
 * @param {String | Boolean} [padding] Defaults to one space character. Will never pad if set to false, implying clip=true
 * @param {Boolean} [alignRight] Truthy would pad unto the left end, right-aligning text
 * @param {Boolean} [clip] If true, will always ensure the text is never longer than given length. Defaults to opposite of padding.
 * @returns {*}
 */
function stringResize(string, length, padding, alignRight, clip) {
	// If  a padding string is specified, use it.f it's false, do not pad, and else use normal spaces.
	padding = padding && padding.length ? padding : (padding === false ? false : ' ' );

	// Use clip setting if it was explicitly set to true or false, else use the opposite of padding
	clip = clip === !!clip ? clip : !padding;

	if (string.length === length)
		// Take a bow and exit early
		return string;

	if (string.length > length)
		// Return the string or a clipped version (taking alignment into account)
		return !clip ? string : string.substr(alignRight ? (string.length - length) : 0, length);

	if (padding !== false && string.length < length)
		// If the string is not long enough, pad on appropriate side
		string = alignRight ? fillerString(length - string.length, padding) + string : string + fillerString(length - string.length, padding);

	return string;
}