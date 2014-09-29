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

	this.openRoute = function (routeName) {
		var route = routes[routeName];
		for (var cellName in route) {
			if (route.hasOwnProperty(cellName)) {
				this.openView(cellName, route[cellName]);
			}
		}

		onRouteChange.forEach(function (listener) {
			listener(route, routeName);
		});
	};

	this.openView = function (cellName, view) {
		var cell = cells[cellName];
		cell.setView(view);
	};

	// @TODO: Make event emitter because fuck you
	this.onRouteChange = function (cb) {
		onRouteChange.push(cb);
	}

}