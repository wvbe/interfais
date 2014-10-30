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
	 * @name Interfais#config
	 * @type {Object}
	 */
	this.config = config;

	/**
	 * @name Interfais#inputManager
	 * @type {InputManager}
	 */
	this.inputManager = new InputManager(this);

	/**
	 * @name Interfais#focusManager
	 * @type {FocusManager}
	 */
	this.focusManager = new FocusManager(this);

	/**
	 * @name Interfais#routeManager
	 * @type {RouteManager}
	 */
	this.routeManager = new RouteManager(this);

	/**
	 * @name Interfais#uiFactory
	 * @memberof Interfais
	 * @type {UiFactory}
	 */
	this.uiFactory    = new UiFactory(this);

	/**
	 * @name Interfais#viewFactory
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
		$this.focusManager.select(); // Shouldnt be neccessary, but avoids the "no focus before first refocus" bug
	});


	// When terminal is resized
	process.stdout.on('resize', function () {
		$this.layout.prerender();
		$this.layout.render();
	});

	$this.layout.prerender();

	$this.inputManager.init();

	// @TODO: The following system crash occurs when keyNext == 'menuNext', but not when keyPrevious = 'menuPrevious'
	// TypeError: Cannot read property 'emitter' of null
	//     at EventEmitter.forkedEmitter.emitter.destroy (/home/wybe/git/interfais/lib/managers/InputManager.js:79:17)
	//     at FocusableObject.command.blur (/home/wybe/git/interfais/lib/factories/aspects/uiInput.js:58:13)
	//     at FocusManager.select (/home/wybe/git/interfais/lib/managers/FocusManager.js:104:31)
	//     at FocusManager.shift (/home/wybe/git/interfais/lib/managers/FocusManager.js:93:8)
	//     at EventEmitter.<anonymous> (/home/wybe/git/interfais/lib/managers/FocusManager.js:51:11)
	//     at EventEmitter.emit (events.js:117:20)
	//     at ReadStream.emitKeyboardEvent (/home/wybe/git/interfais/lib/managers/InputManager.js:171:21)
	//     at ReadStream.emit (events.js:98:17)
	//     at emitKey (/home/wybe/git/interfais/node_modules/keypress/index.js:566:10)
	//     at ReadStream.onData (/home/wybe/git/interfais/node_modules/keypress/index.js:47:11)

	$this.focusManager.init({
		keyPrevious:  'focusPrevious',
		keyNext: 'focusNext'
	});

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