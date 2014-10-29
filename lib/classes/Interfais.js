var layoutFactory = require('./../factories/layoutFactory'),
	UiFactory     = require('./../factories/UiFactory'),
	ViewFactory   = require('./../factories/ViewFactory'),

	InputManager  = require('./../managers/InputManager'),
	FocusManager  = require('./../managers/FocusManager'),
	RouteManager  = require('./../managers/RouteManager');

/**
 * @namespace Interfais
 * @param config
 * @constructor
 */
function Interfais (config) {
	/**
	 * @name config
	 * @memberof Interfais
	 * @type {Object}
	 */
	this.config = config;

	/**
	 * @name inputManager
	 * @memberof Interfais
	 * @type {InputManager}
	 */
	this.inputManager = new InputManager(this);

	/**
	 * @name focusManager
	 * @memberof Interfais
	 * @type {FocusManager}
	 */
	this.focusManager = new FocusManager(this);

	/**
	 * @name routeManager
	 * @memberof Interfais
	 * @type {RouteManager}
	 */
	this.routeManager = new RouteManager(this);

	/**
	 * @name uiFactory
	 * @memberof Interfais
	 * @type {UiFactory}
	 */
	this.uiFactory    = new UiFactory(this);

	/**
	 * @name viewFactory
	 * @memberof Interfais
	 * @type {ViewFactory}
	 */
	this.viewFactory  = new ViewFactory(this);

	init.apply(this);
}

function init() {
	var $this = this;
	$this.layout = layoutFactory($this);

	// When another route is opened
	$this.routeManager.onRouteChange(function () {
		var current = $this.focusManager.getCurrent();

		if (!current)
			return;

		current.focus();
		$this.layout.render();
	});


	// When terminal is resized
	process.stdout.on('resize', function () {
		$this.layout.prerender();
		$this.layout.render();
	});

	$this.layout.prerender();

	$this.inputManager.init();
	$this.focusManager.init();
	$this.routeManager.init();

	$this.layout.render();

	$this.inputManager.on('exit', function (key) {
		console.log('Exiting after ' + key.combo);
		process.exit();
	});


	$this.inputManager.on('render', function () {
		$this.layout.prerender();
		$this.layout.render();
	});

}

module.exports = Interfais;