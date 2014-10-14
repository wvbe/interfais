var Layout = require('./../classes/Layout'),
	Row = require('./../classes/Row'),
	Cell = require('./../classes/Cell');


module.exports = function(app) {

	function interpretLayoutConfig(options) {
		if (!options)
			throw new Error('No layout configuration');

		var rows, layout;

		if (typeof options.map === 'function') {
			rows = options.map(interpretRowConfig);
			options = {};
		} else {
			rows = (options.rows || []).map(interpretRowConfig);
			options.rows = null;
		}

		layout = new Layout(options);

		rows.forEach(function (row) {
			layout.addChild(row);
		});

		return layout;
	}

	function interpretRowConfig(options) {
		var cells, row;

		if (typeof options.map === 'function') {
			cells = options.map(interpretCellConfig);
			options = {};
		} else {
			cells = (options.cells || []).map(interpretCellConfig);
			options.cells = null;
		}

		row = new Row(options);

		cells.forEach(function (cell) {
			row.addChild(cell);
		});

		return row;
	}

	function interpretCellConfig(cellConfig) {
		var cell = new Cell(cellConfig);

		if (cellConfig.name) {
			route.registerCell(cellConfig.name, cell);
		}

		if (cellConfig.view) {
			cell.setView(app.viewFactory(cellConfig.view));
		}

		if (cell.canFocus)
			focus.addView(cell);

		return cell;
	}

	var config = app.config.layout,
		focus = app.focusManager,
		route = app.routeManager;

	return interpretLayoutConfig(config);
}