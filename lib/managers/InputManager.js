var keypress = require('keypress'),
	EventEmitter = require('events').EventEmitter,
	REGEX_VALID_SYSNAMES = new RegExp(/^[a-zA-Z0-9-+=_!@#~\$%\^&\*\(\)\[\]\{\}<>\.\,:;\u00C0-\u00ff]+$/);

module.exports = InputManager;

/**
 * @name InputManager
 * @param {Interfais} app
 * @constructor
 */
function InputManager(app) {
	var $this = this,
		internalEmitter = new EventEmitter(),
		forkedEmitter = null,
		configurableKeys = {
			exit: ['ctrl+q', 'ctrl+c'],
			render: 'ctrl+r',
			scrollUp: 'shift+up',
			scrollDown: 'shift+down',
			focusNext: 'tab',
			focusPrevious: 'shift+tab',
			menuPrevious: 'up',
			menuNext: 'down',
			menuConfirm: 'return'
		},
		specialKeys = {};

	/**
	 * Initalize inputmanager, effecively hijacks stdin and creates an internal EventEmitter to do
	 * all kinds of clever shit.
	 * @method InputManager#init
	 */
	$this.init = function () {
		keypress(process.stdin);

		process.stdin.setRawMode(true);
		process.stdin.resume();

		process.stdin.on('keypress', emitKeyboardEvent);

		if(app.config.keyBinds)
			for(var action in app.config.keyBinds)
				if(app.config.keyBinds.hasOwnProperty(action) && (app.config.keyBinds[action].length > 0 || app.config.keyBinds[action] === false))
					configurableKeys[action] = app.config.keyBinds[action];

		for(var action in configurableKeys)
			if(configurableKeys.hasOwnProperty(action) && configurableKeys[action])
				$this.catch(configurableKeys[action], action);
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
	 * @method InputManager#fork
	 * @param regex
	 * @returns {EventEmitter}
	 */
	$this.fork = function (regex) {
		if (forkedEmitter !== null) {
			forkedEmitter.emitter.destroy();
		}

		if (!regex)
			regex = REGEX_VALID_SYSNAMES;

		forkedEmitter = {
			emitter: new EventEmitter(),
			regex: regex
		};

		forkedEmitter.emitter.destroy = function () {
			if(forkedEmitter === null) {
				// @EXCEPTION: A forked Input emitter was destroyed twice for unknown reason.
				return;
			}
			forkedEmitter.emitter.removeAllListeners();
			forkedEmitter = null;
		};

		return forkedEmitter.emitter;
	};

	/**
	 * Add an event listener and prevent event from being emitted to other listeners. Any key combination can be caught
	 * only once, $this function overwrites the previous catch.
	 * @method InputManager#catch
	 * @param {String|Array<String>} combo
	 * @param {String|Function} eventOrCb InutManager emits event if this is a string, or executes the callback if it is a function
	 */
	$this.catch = function (combo, eventOrCb) {
		if (typeof combo === 'object' && combo.length)
			combo.forEach(function (comboItem) {
				$this.catch(comboItem, eventOrCb);
			});
		else
			specialKeys[combo] = eventOrCb;
	};

	/**
	 * Release an event which would normally be caught.
	 * @method InputManager#release
	 * @param {String|Array<String>} combo
	 */
	$this.release = function (combo) {
		if (typeof combo === 'object' && combo.length)
			combo.forEach(function (comboItem) {
				$this.release(comboItem);
			});
		else
			specialKeys[combo] = null;
	};

	/**
	 * Add an event listener
	 * @method InputManager#on
	 * @param {String|Array<String>} combo
	 * @param {Function} cb
	 */
	$this.on = function (combo, cb) {
		if (typeof combo === 'object' && combo.length)
			combo.forEach(function (comboItem) {
				$this.on(comboItem, cb);
			});
		else
			internalEmitter.addListener.apply(internalEmitter, arguments);
	};

	/**
	 * Remove an event listener
	 * @method InputManager#off
	 * @param {String|Array<String>} combo
	 * @param {String|Function} cb
	 */
	$this.off = function (combo, cb) {
		if (typeof combo === 'object' && combo.length)
			combo.forEach(function (comboItem) {
				$this.off(comboItem, cb);
			});
		else {
			internalEmitter.removeListener.apply(internalEmitter, arguments);
		}
	};

	function emitKeyboardEvent(ch, key) {

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
		if (specialKeys[key.combo]) {
			var eventOrCb = specialKeys[key.combo];
			if(typeof eventOrCb === 'function')
				specialKeys[key.combo](key);
			else if(typeof eventOrCb === 'string')
				internalEmitter.emit(eventOrCb, key);
			return;
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
	}
}

