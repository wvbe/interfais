var FocusableObject = require('../classes/FocusableObject');

module.exports = FocusManager;

/**
 * Takes care of focus on a subset of focusables (Cells and UI option/input items)
 * @name FocusManager
 * @param app
 * @constructor
 */
function FocusManager(app) {
	var $this = this,
		focusableItems = [],
		focusIndex = null,
		destroyers = [];

	this.FocusableObject = FocusableObject;

	this.keys = {};

	/**
	 * Initializes itself for the global
	 * @TODO: Concatenate all key override configurables in an object that is more generic than
	 *        current key configuration names focusNext, focusPrevious, menuNext, menuPrevious.
	 *        Suggested variable names: keyNext, keyPrevious, keyConfirm, keyEscape
	 * @method InputManager#init
	 */
	this.init = function (keyConfig, onFocusChange) {

		var actions = {
			keyPrevious: function keyPrevious(key) {
				$this.shift(true);

				if(typeof onFocusChange === 'function')
					onFocusChange($this.getCurrent(), key);
			},
			keyNext: function keyNext (key) {
				$this.shift(false);

				if(typeof onFocusChange === 'function')
					onFocusChange($this.getCurrent(), key);
			},
			keyConfirm: function keyConfirm(key) {
				$this.getCurrent().confirm();
			}
		};


		for (var focusAction in keyConfig) {
//			if(!keyConfig.hasOwnProperty(focusAction))
//				continue;

			var inputKeyName = keyConfig[focusAction];

			if(!inputKeyName)
				continue;
			var thisParticularAction = actions[focusAction];

			if(typeof thisParticularAction !== 'function')
				throw new Error('You\'re configuring the "'+inputKeyName+'" key for "'+focusAction+'" on a new FocusManager, which doesnt exist');

			app.inputManager.on(inputKeyName, thisParticularAction);

			destroyers.push({
				inputKeyName: inputKeyName,
				focusAction: focusAction,
				cb: thisParticularAction
			});
		}

		if(focusableItems.length && focusIndex === null)
			$this.select(0);
	};

	this.destroy = function() {
		while(destroyers.length > 0){
			var destroyer = destroyers.pop();
			app.inputManager.off(destroyer.inputKeyName, destroyer.cb);
		};
	};


	this.addView = function (cell) {
		focusableItems.push(cell);
		return this;
	};

	this.removeView = function (cell) {
		focusableItems.splice(focusableItems.indexOf(cell), 1);
		return this;
	};

	this.isFocusable = function (cell) {
		return focusableItems.indexOf(cell) >= 0;
	};

	this.getCurrent = function () {
		return focusableItems[focusIndex];
	};

	this.shift = function (reverse) {
		if(!focusableItems.length)
			return;

		++this.shifts;
		var i = focusIndex || 0;

		if (reverse)
			i = i === 0 ? focusableItems.length - 1 : --i;
		else
			i = i === focusableItems.length - 1 ? 0 : ++i;

		this.select(i);
	};

	// @TODO: Rename to focusManager()
	this.select = function (i) {
		if (!focusableItems[i])
			throw new Error('View ' + i + ' does not exist');
		if (typeof focusableItems[i].focus !== 'function')
			throw new Error('View ' + i + ' has no focus()');

		if (focusIndex !== null && focusableItems[focusIndex].blur)
			focusableItems[focusIndex].blur();

		focusIndex = i;
		focusableItems[i].focus();
	};

}