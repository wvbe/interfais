module.exports = function (app) {
	var inputManager = app.inputManager,
		focusManager = app.focusManager,
		uiFactory = app.uiFactory;

	/**
	 *
	 * @param {Function} cb Inject app UI config here, cb is called with the result of uiFactory for the relevant view
	 * @returns {View}
	 */
	function viewFactory(cb) {

		return function View (cell, args) {

			var $this = this,
				ui = new uiFactory(),
				active = false,
				focused = false,
				renderInterval = false,
				dimmedForegroundColor = 242;

			if(focusManager.isFocusable(cell))
				ui.foreground(dimmedForegroundColor);

			try {
				cb(ui, args);
			} catch (e) {
				console.error('Error while constructing a new ui in viewFactory');
				console.error(e.stack);
				process.exit();
			}

			$this.open = function () {
				ui.emit('open');
				active = true;

				if (ui.interval && ui.interval > 0)
					renderInterval = setInterval(function () {
						ui.emit('interval');
						$this.render();
					}, ui.interval);
			};

			$this.prerender = function () {
				ui.within({
					width: cell.prerendered.width,
					height: cell.prerendered.height,
					x: cell.prerendered.x,
					y: cell.prerendered.y
				});
			};

			$this.render = function () {
				ui.emit('render');
				if (active)
					ui.render();
			};

			$this.focus = function () {
				focused = true;

				ui.emit('focus');
				menuSetListeners();

				if(focusManager.isFocusable(cell))
					ui.foreground(false);

				if (ui.isInteractive()) {
					//@TODO: $this was very lazy of me
					ui._menu.getCurrent().focus();
				}

				$this.render();
				scrollSetListeners()

			};

			$this.blur = function () {
				focused = false;

				ui.emit('blur');
				menuRemoveListeners();

				//@TODO: Conditionally, configurably, hip-hop
				if(focusManager.isFocusable(cell))
					ui.foreground(dimmedForegroundColor);

				if (ui.isInteractive()) {
					//@TODO: $this was very lazy of me
					ui._menu.getCurrent().blur();
				}


				scrollRemoveListeners();
				$this.render();
			};

			$this.close = function () {

				ui.emit('close');
				menuRemoveListeners();

				if (ui.interval)
					clearInterval(renderInterval);

				ui.off();

				active = false;

				// @TODO: Dirty hack to stop redrawing views that are no longer opened should not be dirty
				//        - Should fix $this when doing the eventemitter stuff
				//        - Should test $this also
				ui.render = function () {
				};

			};

			/**
			 * @TODO: Move the following functions to their congruent ui aspects, and rely on event emitterness
			 */
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
				ui.focusConfirm();
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
				ui.render();
			}

			function scrollUp() {
				ui.scrollUp();
				ui.render();
			}


		}
	}

	return viewFactory;
};