var keypress = require('keypress'),
	EventEmitter = require('events').EventEmitter;


/**
 * Accepts:
 * abcdefghijklmnopqrstuvwxyz
 * ABCDEFGHIJKLMNOPQRSTUVWXYZ
 * 0123456789
 * -_.,:;()[]{}
 * @type {RegExp}
 */
var REGEX_VALID_SYSNAMES = new RegExp(/^[a-zA-Z0-9-+=_!@#~\$%\^&\*\(\)\[\]\{\}<>\.\,:;\u00C0-\u00ff]+$/);

module.exports = InputManager;

function InputManager(app) {
	var internalEmitter = new EventEmitter(),
		special_keys = {},
		inputCatch = null;

	this.init = init;
	this.deinit = deinit;
	this.on = keypressOn;
	this.off = keypressOff;
	this.catch = keypressCatch;
	this.release = keypressRelease;
	this.input = catchInput;

	function init() {
		// Normalize keystrokes
		keypress(process.stdin);
		process.stdin.setRawMode(true);
		process.stdin.resume();

		process.stdin.on('keypress', function (ch, key) {

			// Normalize keypress output to always have a key object
			if (!key)
				key = {}; // Unknown keys (eg. numpad)
			if (ch !== undefined) {
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


			if (!inputCatch)
				return;
			if (['backspace', 'delete', 'return', 'left', 'right', 'home', 'end'].indexOf(key.name) >= 0) {
				return inputCatch.emitter.emit(key.name, key);
			}
			if (inputCatch.regex.test(key.sequence))
				return inputCatch.emitter.emit('*', key);
		});

	}

	function deinit() {
		// Untested
		process.stdin.setRawMode(false);
		process.stdin.pause();
	}

	/**
	 * Creates a temporary EventEmitter that handles a select range of input so it
	 * can be handled in an input field.
	 * @note Emit 'destroy' to remove the inputCatch and destroy the eventlistener
	 * @param regex
	 * @returns {EventEmitter}
	 */
	function catchInput(regex) {
		if (inputCatch !== null)
			inputCatch.emitter.destroy();

		if (!regex)
			regex = REGEX_VALID_SYSNAMES;

		inputCatch = {
			emitter: new EventEmitter(),
			regex: regex
		};

		inputCatch.emitter.destroy = function () {
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

}

