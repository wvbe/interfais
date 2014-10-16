var
// @TODO: This helper shouldnt have to be here
	paint = require('./../helpers/paintHelper'),

	layoutFactory = require('./layoutFactory'),
	UiFactory = require('./UiFactory'),
	ViewFactory = require('./ViewFactory'),

	InputManager = require('./../managers/InputManager'),
	FocusManager = require('./../managers/FocusManager'),
	RouteManager = require('./../managers/RouteManager')
	;


function AppFactory(initConfig) {
	this.config = initConfig;
	this.inputManager = new InputManager(this);
	this.focusManager = new FocusManager(this);
	this.routeManager = new RouteManager(this);

	this.uiFactory = new UiFactory(this);
	this.viewFactory = new ViewFactory(this);


	init(this);
}

function init($this) {

	$this.layout = layoutFactory($this);

	// When another route is opened
	$this.routeManager.onRouteChange(function () {
		var current = $this.focusManager.getCurrent();

		if (!current)
			return;

		current.focus();
		$this.layout.render();
	});

	// Focus next menu
	$this.inputManager.catch('tab', function (key) {
		$this.focusManager.shift();
	});

	// Focus previous menu
	$this.inputManager.catch('shift+tab', function (key) {
		$this.focusManager.shift(true);
	});

	// Rerender layout
	$this.inputManager.catch('ctrl+r', function () {
		paint.wipe();
		$this.layout.prerender();
		$this.layout.render();
	});

	// Quit
	$this.inputManager.catch(['ctrl+c', 'ctrl+q'], function (key) {
		console.log('Exiting after ' + key.combo);
		process.exit();
	});

	// When terminal is resized
	process.stdout.on('resize', function () {
		paint.wipe();
		$this.layout.prerender();
		$this.layout.render();
	});

	$this.layout.prerender();

	paint.init();
	$this.inputManager.init();
	$this.focusManager.init();
	$this.routeManager.init();

}

module.exports = AppFactory;