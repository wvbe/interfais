var uiFactory = require('./uiFactory');
var input = require('../managers/inputManager');

// @TODO: Color themes
var defaults = {
	// Normal menu items in a view that is currently focused
	normalPrefix: '  ',
	normalBackground: false, // means transparent
	normalForeground: null, // means do-not-change,

	// Menu item that is selected/hovered
	selectionPrefix: '> ',
	selectionForeground: 255, // white
	selectionBackground: 20, // med blue

	// Normal menu items in a view that is not focused
	unfocusBackground: false,
	unfocusForeground: 242,

	// And the line that is selected
	unfocusSelectionForeground: 247, // dark white :D
	unfocusSelectionBackground: 18 // dark blue
};

/**
 * Provides a low-effort way to declare a new View that can be used in a Cell and with RouteManager. It takes a callback
 * which is executed at ui bootstrapping time. Use it to configure the uiFactory for your view.
 * @param cb
 * @returns {ContentConfigurationView}
 */
module.exports = function renderableMenuFactory(cb) {
	return function ContentConfigurationView(cell, args) {

		var ui = new uiFactory(),
			active = false,
			focused = false;

		try {
			cb(ui, args);
		} catch (e) {
			console.error('Error while constructing a new ui in viewFactory');
			console.error(e.stack);
			process.exit();
		}

		return {
			open: function () {
				active = true;

				if (ui.interval && ui.interval > 0)
					renderInterval = setInterval(function () {
						cell.render();
					}, ui.interval);

				if(ui.isInteractive())
					ui.resetFocus();
			},

			prerender: function () {
				ui.within({
					width: cell.prerendered.width,
					height: cell.prerendered.height,
					x: cell.prerendered.x,
					y: cell.prerendered.y
				});
			},

			render: function () {
				ui.render();
			},

			focus: function () {
				focused = true;

				menuSetListeners();
				//@TODO: Conditionally, ...
				ui.foreground(255);
				cell.render();

			},

			blur: function () {
				focused = false;
				menuRemoveListeners();

				//@TODO: Conditionally, ...
				ui.foreground(245);

				cell.render();
			},

			close: function () {
				active = false;

				menuRemoveListeners();
				if (ui.interval)
					clearInterval(renderInterval);
			}

		};

		// Menu helper functions
		// @todo move


		function menuSetListeners() {

			if (ui.isInteractive()) {
				input.catch('up', menuSelectPrevious);
				input.catch('down', menuSelectNext);
				input.catch('return', menuSelectConfirm);
				input.catch('backspace', menuSelectEscape);
			}
		}
		function menuRemoveListeners() {

			if (ui.isInteractive()) {
				input.release('up', menuSelectPrevious);
				input.release('down', menuSelectNext);
				input.release('return', menuSelectConfirm);
				input.release('backspace', menuSelectEscape);
			}
		}
		function menuSelectPrevious() {
			ui.focusPrevious();
			ui.render();
		}

		function menuSelectNext() {
			ui.focusNext();
			ui.render();
		}

		function menuSelectConfirm() {
			ui.selectFocused();
		}

		function menuSelectEscape() {
			menuSelect(position.getParent());
		}

		function menuSelect(item) {
			if (!item)
				return;

			position = item;
			focusedItem = 0;

			cell.clear();
			ui.render();
		}

	}
};