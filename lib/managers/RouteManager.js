module.exports = RouteManager;
/**
 * @name RouteManager
 * @TODO: Subject to refactoring, code is quite old.
 * @param {Interfais} app
 * @constructor
 */
function RouteManager(app) {

	var routes = {},
		cells = {},
		onRouteChange = [];


	/**
	 * @method RouteManager#init
	 */
	this.init = function () {

	};

	/**
	 * @method RouteManager#registerRoute
	 * @param routeName
	 * @param routeViews
	 */
	this.registerRoute = function (routeName, routeViews) {
		Object.keys(routeViews).forEach(function (routeViewFn) {
			routeViews[routeViewFn] = app.viewFactory(routeViews[routeViewFn]);
		});
		routes[routeName] = routeViews;
	};

	/**
	 * @method RouteManager#registerCell
	 * @param cellName
	 * @param cell
	 */
	this.registerCell = function (cellName, cell) {
		cells[cellName] = cell;
	};

	/**
	 * @method RouteManager#openRoute
	 * @param routeName
	 * @param args
	 * @returns {*}
	 */
	this.openRoute = function (routeName, args) {
		var route = routes[routeName];

		if (!route && routes['404'])
			return this.openRoute('404', args);

		for (var cellName in route) {
			if (route.hasOwnProperty(cellName)) {
				this.openView(cellName, route[cellName], args);
			}
		}

		onRouteChange.forEach(function (listener) {
			listener(route, routeName);
		});
	};

	/**
	 * @method RouteManager#openView
	 * @param cellName
	 * @param view
	 * @param args
	 */
	this.openView = function (cellName, view, args) {
		var cell = cells[cellName];

		// If cell does not exist, skip
		if (!cell)
			throw new Error('Route contains invalid cell "' + cellName + '"');
		cell.setView(view, args);
	};

	/**
	 * @method RouteManager#onRouteChange
	 * @TODO: Make event emitter because fuck you
	 * @param cb
	 */
	this.onRouteChange = function (cb) {
		onRouteChange.push(cb);
	}

}