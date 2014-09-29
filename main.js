module.exports = {
	appFactory: require('./lib/factories/appFactory'),
	viewFactory: require('./lib/factories/viewFactory'),

	// @TODO: This is gonna be deprecated when uiFactory gets a neat syntax to include
	//        different lifecycle listeners. uiFactory could be an eventEmitter.
	contentFactory: require('./lib/factories/uiFactory'),

	inputManager: require('./lib/managers/inputManager'),
	routeManager: require('./lib/managers/RouteManager')
};