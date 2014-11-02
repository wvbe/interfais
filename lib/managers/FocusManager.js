var FocusableObject = require('../classes/FocusableObject');

module.exports = FocusManager;
module.exports.FocusableObject = FocusableObject;

/**
 * Takes care of focus on a subset of focusables (Cells and UI option/input items)
 * @name FocusManager
 * @param {Interfais} app
 * @constructor
 */
function FocusManager(app) {
	var $this = this,
		focusableItems = [],
		focusIndex = null,
		destroyers = [];

	this.FocusableObject = FocusableObject;

	/**
	 * Sets event listeners on inputManager for this instance. Event listeners should be unset using destroy().
	 * @method FocusManager#init
	 * @param {Object} [keyConfig] Map keys to actions on the array. Unmapped actions will not be enabled.
	 * @param {String} [keyConfig.keyPrevious] Keyname to map to "focus on previous menu" action
	 * @param {String} [keyConfig.keyNext] Keyname to map to "focus on next menu" action
	 * @param {String} [keyConfig.keyConfirm] Keyname to map to "select focused menu item" action
	 * @param {Function} [onFocusChange] Executes whenever focus on this menu is changed.
	 * @TODO: Refactor onFocusChange argument to be configured through dedicated method
	 * @TODO: Concatenate all key override configurables in an object that is more generic than
	 *        current key configuration names focusNext, focusPrevious, menuNext, menuPrevious.
	 *        Suggested variable names: keyNext, keyPrevious, keyConfirm, keyEscape
	 */
	this.init = function (keyConfig, onFocusChange) {
		if(destroyers.length)
			return; // Already initialized

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

		if(focusableItems.length)
			$this.select(focusIndex === null ? 0 : focusIndex);
	};

	/**
	 * Destroys listeners on inputManager for the events in init()
	 * @method FocusManager#destroy
	 */
	this.destroy = function() {
		while(destroyers.length > 0){
			var destroyer = destroyers.pop();
			app.inputManager.off(destroyer.inputKeyName, destroyer.cb);
		};
	};

	/**
	 * List an item as focusable. Will automatically select it if it's the first one.
	 * @method FocusManager#add
	 * @param focusableItem
	 * @returns {FocusManager}
	 */
	this.add = function (focusableItem) {
		focusableItems.push(focusableItem);

		return this;
	};
	/**
	 * Planned for use while restructuring layout or disabling input() or option() UI. Not currently in use.
	 * @method FocusManager#remove
	 * @param focusableItem
	 * @returns {FocusManager}
	 */
	this.remove = function (focusableItem) {
		focusableItems.splice(focusableItems.indexOf(focusableItem), 1);
		return this;
	};

	/**
	 * Returns wether or not given object is already focusably by this manager.
	 * @method FocusManager#isFocusable
	 * @param focusableItem
	 * @returns {boolean}
	 */
	this.isFocusable = function (focusableItem) {
		return focusableItems.indexOf(focusableItem) >= 0;
	};

	/**
	 * Return the currently focused element. Do not call lifecycle methods on it!
	 * @method FocusManager#getCurrent
	 * @returns {*}
	 */
	this.getCurrent = function () {
		return focusableItems[focusIndex];
	};

	/**
	 * Focus the next focusable item.
	 * @method FocusManager#shift
	 * @param {Boolean} [reverse] True to focus previous item
	 */
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

	/**
	 * @method FocusManager#select
	 * @param {Number} [nth] Focus on the nth item, or refocus on current (safe)
	 */
	this.select = function (nth) {

		if(nth === undefined)
			nth = focusIndex;

		if (!focusableItems[nth])
			throw new Error('View ' + nth + ' does not exist');

		if (typeof focusableItems[nth].focus !== 'function')
			throw new Error('View ' + nth + ' has no focus()');

		if (focusIndex !== null && focusableItems[focusIndex].blur)
			focusableItems[focusIndex].blur();

		focusIndex = nth;

		focusableItems[nth].focus();
	};

}