var keypress = require('keypress'),
	EventEmitter = require('events').EventEmitter,

	// Accepts:
	//     abcdefghijklmnopqrstuvwxyz
	//     ABCDEFGHIJKLMNOPQRSTUVWXYZ
	//     0123456789
	//     -_.,:;()[]{}
	REGEX_VALID_SYSNAMES = new RegExp(/^[a-zA-Z0-9-+=_!@#~\$%\^&\*\(\)\[\]\{\}<>\.\,:;\u00C0-\u00ff]+$/);

module.exports = InputManager;

/**
 * @name InputManager
 * @constructor
 */
function InputManager() {
	var $this = this,
		internalEmitter = new EventEmitter(),
		forkedEmitter = null,
		special_keys = {};

	/**
	 * Initalize inputmanager, effecively hijacks stdin and creates an internal EventEmitter to do
	 * all kinds of clever shit.
	 * @name init
	 * @memberof InputManager
	 */
	$this.init = function () {
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


			if (!forkedEmitter)
				return;
			if (['backspace', 'delete', 'return', 'left', 'right', 'home', 'end'].indexOf(key.name) >= 0) {
				return forkedEmitter.emitter.emit(key.name, key);
			}
			if (forkedEmitter.regex.test(key.sequence))
				return forkedEmitter.emitter.emit('*', key);
		});
	};

	/**
	 * Creates a temporary EventEmitter that handles a select range of input so it
	 * can be handled in an {UiFactory#input} field. Accepts backspace, delete, return,
	 * arrows left and right, home and end. Additionally you can configure a regex to
	 * match for valid characters, default is a-zA-Z0-9 and some special characters,
	 * but not spaces.
	 *
	 * @note Call 'destroy' method on the returned object to remove the forked event-
	 * emitter etc.
	 *
	 * @name fork
	 * @memberof InputManager
	 * @param regex
	 * @returns {EventEmitter}
	 */
	$this.fork = function (regex) {
		if (forkedEmitter !== null)
			forkedEmitter.emitter.destroy();

		if (!regex)
			regex = REGEX_VALID_SYSNAMES;

		forkedEmitter = {
			emitter: new EventEmitter(),
			regex: regex
		};

		forkedEmitter.emitter.destroy = function () {
			forkedEmitter.emitter.removeAllListeners();
			forkedEmitter = null;
		};

		return forkedEmitter.emitter;
	};

	/**
	 * Add an event listener and prevent event from being emitted to other listeners. Any key combination can be caught
	 * only once, $this function overwrites the previous catch.
	 * @name catch
	 * @memberof InputManager
	 * @param {String|Array<String>} combo
	 * @param {Function} cb
	 */
	$this.catch = function (combo, cb) {
		if (typeof combo === 'object' && combo.length)
			combo.forEach(function (comboItem) {
				$this.catch(comboItem, cb);
			});
		else
			special_keys[combo] = cb;
	};

	/**
	 * Release an event which would normally be caught.
	 * @name release
	 * @memberof InputManager
	 * @param {String|Array<String>} combo
	 */
	$this.release = function (combo) {
		if (typeof combo === 'object' && combo.length)
			combo.forEach(function (comboItem) {
				_release(comboItem);
			});
		else
			special_keys[combo] = null;
	};

	/**
	 * Add an event listener
	 * @name on
	 * @memberof InputManager
	 * @param {String|Array<String>} combo
	 * @param {Function} cb
	 */
	$this.on = function (combo, cb) {
		if (typeof combo === 'object' && combo.length)
			combo.forEach(function (comboItem) {
				_on(comboItem, cb);
			});
		else
			internalEmitter.addListener.apply(internalEmitter, arguments);
	};

	/**
	 * Remove an event listener
	 * @name off
	 * @memberof InputManager
	 * @param {String|Array<String>} combo
	 * @param {Function} cb
	 */
	$this.off = function (combo, cb) {
		if (typeof combo === 'object' && combo.length)
			combo.forEach(function (comboItem) {
				_off(comboItem, cb);
			});
		else
			internalEmitter.removeListener.apply(internalEmitter, arguments);
	};
}

