module.exports = function ViewFactory(app) {
	var inputManager = app.inputManager,
		focusManager = app.focusManager,
		uiFactory = app.uiFactory;

	return function viewFactory(cb) {
		return function (cell, args) {

			var ui = new uiFactory(),
				active = false,
				focused = false,
				renderInterval = false,
				dimmedForegroundColor = 242;

			if(focusManager.isFocusable(cell))
				ui.foreground(dimmedForegroundColor);

			try {
				if (typeof cb === 'string') {
					console.log(cell, cb);
					process.exit();
				}
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

					if (ui.isInteractive())
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
					if (active)
						ui.render();
				},

				focus: function () {
					focused = true;
					ui.emit('focus');
					menuSetListeners();

					if(focusManager.isFocusable(cell))
						ui.foreground(false);

					if (ui.isInteractive()) {
						//@TODO: This was very lazy of me
						ui._menu.getCurrent().focus();
					}
					view.render();
					scrollSetListeners()

				},

				blur: function () {
					focused = false;

					ui.emit('blur');
					menuRemoveListeners();

					//@TODO: Conditionally, configurably, hip-hop
					if(focusManager.isFocusable(cell))
						ui.foreground(dimmedForegroundColor);

					if (ui.isInteractive()) {
						//@TODO: This was very lazy of me
						ui._menu.getCurrent().blur();
					}


					scrollRemoveListeners();
					view.render();
				},

				close: function () {

					ui.emit('close');
					ui.off();

					active = false;

					// @TODO: Dirty hack to stop redrawing views that are no longer opened should not be dirty
					ui.render = function () {
					};


					menuRemoveListeners();
					if (ui.interval)
						clearInterval(renderInterval);
				}

			};


			function menuSetListeners() {

				if (ui.isInteractive()) {
					inputManager.catch('up', menuSelectPrevious);
					inputManager.catch('down', menuSelectNext);
					inputManager.catch('return', menuSelectConfirm);
				}
			}

			function menuRemoveListeners() {

				if (ui.isInteractive()) {
					inputManager.release('up', menuSelectPrevious);
					inputManager.release('down', menuSelectNext);
					inputManager.release('return', menuSelectConfirm);
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

			function scrollSetListeners() {
				inputManager.catch('shift+up', scrollUp);
				inputManager.catch('shift+down', scrollDown);
			}

			function scrollRemoveListeners() {
				inputManager.release('shift+up', scrollUp);
				inputManager.release('shift+down', scrollDown);
			}

			function scrollDown() {
				ui.scrollDown();
				//cell.clear();
				ui.render();
			}

			function scrollUp() {
				ui.scrollUp();
				//cell.clear();
				ui.render();
			}

			return view;

		}
	};
};