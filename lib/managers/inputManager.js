// @TODO: Make constructor, and after that instantiate managers in AppFactory.
//
//

var keypress = require('keypress'),
	EventEmitter = require('events').EventEmitter,
	internalEmitter = new EventEmitter();

var special_keys = {};

// The EventEmitter for an input field, if it is being caught
var inputCatch = null;
/**
 * Accepts:
 * abcdefghijklmnopqrstuvwxyz
 * ABCDEFGHIJKLMNOPQRSTUVWXYZ
 * 0123456789
 * -_.,:;()[]{}
 * @type {RegExp}
 */
var REGEX_VALID_SYSNAMES = new RegExp(/^[a-zA-Z0-9-+=_!@#~\$%\^&\*\(\)\[\]\{\}<>\.\,:;\u00C0-\u00ff]+$/);

function init() {
	// Normalize keystrokes
	keypress(process.stdin);
	process.stdin.setRawMode(true);
	process.stdin.resume();

	process.stdin.on('keypress', function (ch, key) {

		// Normalize keypress output to always have a key object
		if (!key)
			key = {}; // Unknown keys (eg. numpad)
		if(ch!==undefined) {
			key.sequence = ch;
		}

		// Compile string that ID's a pressed combo, as examples: a, shift+a, shift+meta+a
		var keyName = [];

		['ctrl', 'shift', 'meta'].forEach(function (modifier) {
			if (key[modifier]) keyName.push(modifier);
		});
		keyName.push(key.name);

		key.combo = keyName.join('+');

		// Delegate all keypresses to either the catch mechanism or the internal event emitter.
		if (special_keys[key.combo]) {
			special_keys[key.combo](key);
		} else {
			internalEmitter.emit('*', key);
			internalEmitter.emit(key.combo, key);
		}


		if(!inputCatch)
			return;
		if(['backspace', 'delete', 'return', 'left', 'right', 'home', 'end'].indexOf(key.name) >= 0) {
			return inputCatch.emitter.emit(key.name, key);
		}
		if(inputCatch.regex.test(key.sequence))
			return inputCatch.emitter.emit('*', key);
	});

}
function deinit() {
	// Untested
	process.stdin.setRawMode(false);
	process.stdin.pause();
}
/**
 * Handles keyboard input
 * @type {{on: keypressOn, off: keypressOff, catch: keypressCatch, release: keypressRelease}}
 */
module.exports = {
	init: init,
	deinit: deinit,
	on: keypressOn,
	off: keypressOff,
	catch: keypressCatch,
	release: keypressRelease,
	input: catchInput
};

/**
 * @note Emit 'destroy' to remove the inputCatch and destroy the eventlistener
 * @param regex
 * @returns {EventEmitter}
 */
function catchInput(regex) {
	if(inputCatch !== null)
		throw new Error('Previous input catch was not destroyed'+regex);

	if(!regex)
		regex = REGEX_VALID_SYSNAMES;

	inputCatch = {
		emitter: new EventEmitter(),
		regex: regex
	};

	inputCatch.emitter.destroy = function() {
//		console.trace();
//		process.exit();
		inputCatch.emitter.removeAllListeners();
		inputCatch = null;
	};

	return inputCatch.emitter;
}

/**
 * Add an event listener and prevent event from being emitted to other listeners. Any key combination can be caught
 * only once, this function overwrites the previous catch.
 * @param {String|Array<String>} combo
 * @param {Function} cb
 */
function keypressCatch(combo, cb) {
	if (typeof combo === 'object' && combo.length)
		combo.forEach(function (comboItem) {
			keypressCatch(comboItem, cb);
		});
	else
		special_keys[combo] = cb;
}


/**
 * Release an event which would normally be caught.
 * @param {String|Array<String>} combo
 */
function keypressRelease(combo) {
	if (typeof combo === 'object' && combo.length)
		combo.forEach(function (comboItem) {
			keypressRelease(comboItem);
		});
	else
		special_keys[combo] = null;
}

/**
 * Add an event listener
 * @param {String|Array<String>} combo
 * @param {Function} cb
 */
function keypressOn(combo, cb) {
	if (typeof combo === 'object' && combo.length)
		combo.forEach(function (comboItem) {
			keypressOn(comboItem, cb);
		});
	else
		internalEmitter.addListener.apply(internalEmitter, arguments);
}


/**
 * Remove an event listener
 * @param {String|Array<String>} combo
 * @param {Function} cb
 */
function keypressOff(combo, cb) {
	if (typeof combo === 'object' && combo.length)
		combo.forEach(function (comboItem) {
			keypressOff(comboItem, cb);
		});
	else
		internalEmitter.removeListener.apply(internalEmitter, arguments);
}
