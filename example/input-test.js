/***
 * Example application for COMMAND LINE INTERFAIS
 */

var interfais = require('../'),
	inputManager = require('../lib/managers/inputManager'),
	packageJson = require('../package.json');

/***
 * Views
 * -----
 * Create a bunch of views, later to be divided amongst routes and cells. This is where much of your application stuff
 * is going to be rendered for the user. You'll probably want to have one or more folders containing these babies.
 */
var views = {

	// A plain one-liner with custom colors
	'header': interfais.viewFactory(function(ui) {
		ui
			.padding(0,2)
			.background('white')
			.foreground('black')
			.line('EXAMPLE INTERFAIS '+packageJson.version)
	}),

	// Wow it's an interactive menu
	'menu': interfais.viewFactory(function(ui) {
		ui
			.padding(1, 2)
			.margin(1, 2)
			.background('blue')
			.foreground('white')
			.option('Home page', function() {
					interfais.routeManager.openRoute('');
				})
			.option('Other page',function() {
					interfais.routeManager.openRoute('other-page');
				})
			.option('Quit',function() {
					process.exit();
				})
			.spacer()
			.paragraph('Use tab to move focus between shells, use arrows to move focus within a menu and confirm with return.')
	}),

	// Some of the ui elements implemented
	'content--home': interfais.viewFactory(function(ui) {

		var keys = [];

		inputManager.on('*', function(key) {
			keys.unshift(JSON.stringify(key));
			if(keys.length > 10)
				keys.pop();
			ui.render();
		});

		ui
			.margin(1, 2)
			.h1('Home page of some sorts')
			.paragraph('Use the viewFactory to generate (rudimentary) UI elements. More UI is gonna be added. Did this text wrap already?')
			.spacer()
			.list(keys);
	}),

	// A view that is opened through anoter route, would replace content--home
	'content--other-page': interfais.viewFactory(function(ui) {
		ui
			.padding(1, 2)
			.h1('The other page')
			.paragraph('This is the other page');
	}),

	// Ui using a callback to display dynamic content
	'footer': interfais.viewFactory(function(ui) {
		var odd = false;
		ui
			.padding(0,2)
			.interval(500)
			.line(function() {
				odd = !odd;
				return [(odd ? ' ' : '') +'(c) arghfbl']
			});
	})
};

/***
 * Layout, Rows, Cells
 * ------
 * Defines the basic structure of your screen layout. Is an array of Row configuration objects, each consisting of a few
 * configurable whatchamacallits, and an array with Cells, each containing their own whatchamacallits.
 *
 * Layout can have a width and height attribute, defaults to terminal size
 * Row can have a height attribute, leave empty for stretchy behaviour
 * Cell can have a width attribute, leave empty for stretchy behaviour
 * Cells can also have a name attribute for referencing from routeManager, and/or a hardcoded view.
 */
var layout = [

	// Header row with the toolbar cell
	{ height: 1, cells: [
		{ name: 'header', view: views['header']}
	]},

	// Body row, with the menu and content cells
	{ cells: [
		{ name: 'menu', width: 32, canFocus: true },
		{ name: 'content', canFocus: true }
	]},

	// Footer cell (with the footer view, which is unnamed thus cannot be routed)
	{ height: 1, cells: [
		{ name: 'footer', view: views['footer'], canFocus: false }
	]}
];

/***
 * Routes
 * ------
 * Handled by routeManager, is a very simple key/value pair of route name vs. a list of views per named(!) Cell.
 */
var routes = {
	// The '' route is always opened on app boot
	'': {
		menu: views['menu'],
		content: views['content--home']
	},
	'other-page': {
		// Does not change 'menu' view
		content: views['content--other-page']
	}
};

// appFactory eats both layout and route config. This may change in the future
// @TODO: Change in the future
var config = {
	layout: layout,
	routes: routes
};

var app = new interfais.appFactory(config);