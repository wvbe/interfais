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

				if(focusManager.isFocusable(cell))
					ui.foreground(false);

				$this.render();
				scrollSetListeners()

			};

			$this.blur = function () {
				focused = false;

				ui.emit('blur');


				//@TODO: Conditionally, configurably, hip-hop
				if(focusManager.isFocusable(cell))
					ui.foreground(dimmedForegroundColor);

				scrollRemoveListeners();
				$this.render();
			};

			$this.close = function () {

				ui.emit('close');

				if (ui.interval)
					clearInterval(renderInterval);

				scrollRemoveListeners();

				ui.off();

				active = false;


				// @TODO: Dirty hack to stop redrawing views that are no longer opened should not be dirty
				//        - Should fix $this when doing the eventemitter stuff
				//        - Should test $this also
				ui.render = function() {

				};

			};

			/**
			 * @TODO: Move the following functions to their congruent ui aspects, and rely on event emitterness
			 */

			function scrollSetListeners() {
				inputManager.on('scrollUp', scrollUp);
				inputManager.on('scrollDown', scrollDown);
			}

			function scrollRemoveListeners() {
				inputManager.off('scrollUp', scrollUp);
				inputManager.off('scrollDown', scrollDown);
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