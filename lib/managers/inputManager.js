// @TODO: Make constructor, and after that instantiate managers in AppFactory.
//
//

var keypress = require('keypress'),
	EventEmitter = require('events').EventEmitter,
	internalEmitter = new EventEmitter();

keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

var special_keys = {};

// Normalize keystrokes
process.stdin.on('keypress', function (ch, key) {
	if (!key)
		return; // Unknown keys (eg. numpad)


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
});

/**
 * Handles keyboard input
 * @type {{on: keypressOn, off: keypressOff, catch: keypressCatch, release: keypressRelease}}
 */
module.exports = {
	on: keypressOn,
	off: keypressOff,
	catch: keypressCatch,
	release: keypressRelease
};

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
