module.exports = new RouteManager();

function RouteManager() {

	var routes = {},
		cells = {},
		onRouteChange = [];

	this.registerRoute = function (routeName, routeViews) {
		routes[routeName] = routeViews;
	};

	this.registerCell = function (cellName, cell) {
		cells[cellName] = cell;
	};

	this.openRoute = function (routeName, args) {
		var route = routes[routeName];

		if(!route && routes['404'])
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
		cell.setView(view, args);
	};

	// @TODO: Make event emitter because fuck you
	this.onRouteChange = function (cb) {
		onRouteChange.push(cb);
	}

}