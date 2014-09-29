var
	// @TODO: Reintroduce configurability with rc and .json or .ini override files
	// ini = require('ini'),
	// rc = require('rc'),
	// fs = require('fs'),
	// path = require('path'),
	// defaults = ini.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'defaults.clirc'), 'utf-8')),

	// @TODO: This helper shouldnt have to be here
	paint = require('./../helpers/paintHelper'),

	// @TODO: Instantiate in factory
	input = require('./../managers/inputManager'),
	focus = require('./../managers/focusManager'),
	route = require('./../managers/RouteManager'),

	Cell = require('./../classes/Cell'),
	Row = require('./../classes/Row'),
	Layout = require('./../classes/Layout');


function AppFactory(initConfig) {

	// @TODO: Reintroduce configurability with rc and .json or .ini override files
	// var config = rc('cli', defaults);

	var layout = interpretLayoutConfig(initConfig.layout);

	interpretRoutesConfig(initConfig.routes);

	// When another route is opened
	route.onRouteChange(function () {
		focus.getCurrent().setFocus();
		layout.render();
	});

	// Focus next menu
	input.catch('tab', function (key) {
		focus.shift();
	});

	// Focus previous menu
	input.catch('shift+tab', function (key) {
		focus.shift(1);
	});

	// Rerender layout
	input.catch('ctrl+r', function () {
		paint.wipe();
		layout.prerender();
		layout.render();
	});

	// Quit
	input.catch(['escape', 'ctrl+c', 'ctrl+q'], function (key) {
		console.log('Exiting after ' + key.combo);
		process.exit();
	});

	// When terminal is resized
	process.stdout.on('resize', function () {
		paint.wipe();
		layout.prerender();
		layout.render();
	});

	// Go!
	layout.prerender();
	route.openRoute('');


	// Helper functions for interpreting the expected configuration objects:

	function interpretRoutesConfig(options) {
		Object.keys(options).forEach(function (routeName) {
			route.registerRoute(routeName, options[routeName]);
		});
	}

	function interpretLayoutConfig(options) {
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

		if (cellConfig.name)
			route.registerCell(cellConfig.name, cell);

		if (cellConfig.view)
			cell.setView(cellConfig.view);

		if (cell.canFocus)
			focus.addView(cell);

		return cell;
	}
}

module.exports = AppFactory;