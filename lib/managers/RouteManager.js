module.exports = RouteManager;

function RouteManager(app) {

	var routes = {},
		cells = {},
		onRouteChange = [];

	this.init = function () {

	};

	this.registerRoute = function (routeName, routeViews) {
		Object.keys(routeViews).forEach(function (routeViewFn) {
			routeViews[routeViewFn] = app.viewFactory(routeViews[routeViewFn]);
		});
		routes[routeName] = routeViews;
	};

	this.registerCell = function (cellName, cell) {
		cells[cellName] = cell;
	};

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

	this.openView = function (cellName, view, args) {
		var cell = cells[cellName];

		// If cell does not exist, skip
		if (!cell)
			throw new Error('Route contains invalid cell "' + cellName + '"');
		cell.setView(view, args);
	};

	// @TODO: Make event emitter because fuck you
	this.onRouteChange = function (cb) {
		onRouteChange.push(cb);
	}

}