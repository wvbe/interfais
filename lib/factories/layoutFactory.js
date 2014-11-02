var Layout = require('./../classes/Layout'),
	Row = require('./../classes/Row'),
	Cell = require('./../classes/Cell');


function LayoutFactory(app) {

	var config = app.config.layout,
		focus = app.focusManager,
		route = app.routeManager;

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
		}

		row = new Row(options);

		cells.forEach(function (cell) {
			row.addChild(cell);
		});

		return row;
	}

	function interpretCellConfig(cellConfig) {
		var cell;

		if (typeof cellConfig === 'function'){
			cell = new Cell();
			cell.setView(app.viewFactory(cellConfig));

		} else {
			cell = new Cell(cellConfig);

			if (cellConfig.name) {
				route.registerCell(cellConfig.name, cell);
			}

			if (cellConfig.view) {
				cell.setView(app.viewFactory(cellConfig.view));
			}

			if (cell.canFocus) {
				focus.add(cell);
			}
		}

		return cell;
	}

	return interpretLayoutConfig(config);
}

module.exports = LayoutFactory;
