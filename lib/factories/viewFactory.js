var uiFactory = require('./uiFactory');
var input = require('../managers/inputManager');

/**
 * Provides a low-effort way to declare a new View that can be used in a Cell and with RouteManager. It takes a callback
 * which is executed at ui bootstrapping time. Use it to configure the uiFactory for your view.
 * @param cb
 * @returns {ContentConfigurationView}
 */
module.exports = function viewFactory(cb) {
	return function (cell, args) {

		var ui = new uiFactory(),
			active = false,
			focused = false,
			renderInterval = false;

		try {
			cb(ui, args);
		} catch (e) {
			console.error('Error while constructing a new ui in viewFactory');
			console.error(e.stack);
			process.exit();
		}

		var view = {
			open: function () {

				ui.emit('open');
				active = true;
				var self = this;

				if (ui.interval && ui.interval > 0)
					renderInterval = setInterval(function () {
						ui.emit('interval');
						view.render();
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
				ui.emit('render');
				if(active)
					ui.render();
			},

			focus: function () {
				focused = true;
				ui.emit('focus');
				menuSetListeners();
				ui.foreground(255);
				if (ui.isInteractive()) {
					//@TODO: This was very lazy of me
					ui._menu.getCurrent().focus();
				}
				view.render();

			},

			blur: function () {
				focused = false;

				ui.emit('blur');
				menuRemoveListeners();

				//@TODO: Conditionally, ...
				ui.foreground(245);

				if (ui.isInteractive()) {
					//@TODO: This was very lazy of me
					ui._menu.getCurrent().blur();
				}
				view.render();
			},

			close: function () {

				ui.emit('close');
				ui.off();

				active = false;

				// @TODO: Dirty hack to stop redrawing views that are no longer opened should not be dirty
				ui.render = function() {};


				menuRemoveListeners();
				if (ui.interval)
					clearInterval(renderInterval);
			}

		};


		function menuSetListeners() {

			if (ui.isInteractive()) {
				input.catch('up', menuSelectPrevious);
				input.catch('down', menuSelectNext);
				input.catch('return', menuSelectConfirm);
			}
		}
		function menuRemoveListeners() {

			if (ui.isInteractive()) {
				input.release('up', menuSelectPrevious);
				input.release('down', menuSelectNext);
				input.release('return', menuSelectConfirm);
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

		return view;

	}
};