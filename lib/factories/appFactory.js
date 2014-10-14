var
	// @TODO: This helper shouldnt have to be here
	paint = require('./../helpers/paintHelper'),
	layoutFactory = require('./layoutFactory'),
	UiFactory = require('./uiFactory'),
	ViewFactory = require('./viewFactory'),

	InputManager = require('./../managers/inputManager'),
	FocusManager = require('./../managers/focusManager'),
	RouteManager = require('./../managers/RouteManager'),

	Cell = require('./../classes/Cell'),
	Row = require('./../classes/Row'),
	Layout = require('./../classes/Layout');


function AppFactory(initConfig) {
	this.config = initConfig;
	this.inputManager = new InputManager(this);
	this.focusManager = new FocusManager(this);
	this.routeManager = new RouteManager(this);

	this.uiFactory = new UiFactory(this);
	this.viewFactory = new ViewFactory(this);

	this.layout = layoutFactory(this);
}

AppFactory.prototype.init = function() {
	var $this = this;


	//if($this.config.routes)
	Object.keys($this.config.routes).forEach(function (routeName) {
		$this.routeManager.registerRoute(routeName, $this.config.routes[routeName]);
	});

	// When another route is opened
	$this.routeManager.onRouteChange(function () {
		var current = $this.focusManager.getCurrent();

		if(!current)
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

	paint.init();
	$this.inputManager.init();

	// Go!
	$this.layout.prerender();

	$this.inputManager.init();
	$this.focusManager.init();
	$this.routeManager.init();


	$this.routeManager.openRoute('');


};

module.exports = AppFactory;