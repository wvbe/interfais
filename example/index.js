/***
 * Example application for COMMAND LINE INTERFAIS
 */

var interfais = require('../'),
	packageJson = require('../package.json');


/***
 * Layout, Rows, Cells
 * ------
 * Defines the basic structure of your screen layout. Is an array of Row configuration objects, each consisting of a few
 * configurable whatchamacallits, and an array with Cells, each containing their own whatchamacallits.
 *
 * Layout can have a width and height attribute, defaults to terminal size
 * Row can have a height attribute, leave empty for stretchy behaviour
 * Cell can have a width attribute, leav'header'e empty for stretchy behaviour
 * Cells can also have a name attribute for referencing from routeManager, and/or a hardcoded view.
 */
var layout = [

	// Header row with the toolbar cell
	{ height: 1, cells: [
		{ name: 'header', view: function(ui) {
			ui
				.padding(0,2)
				.background('white')
				.foreground('black')
				.line('EXAMPLE INTERFAIS '+packageJson.version)
		}}
	]},

	// Body row, with the menu and content cells
	{ cells: [
		{ name: 'menu', width: 32, canFocus: true },
		{ name: 'content', canFocus: true }
	]},

	// Footer cell (with the footer view, which is unnamed thus cannot be routed)
	{ height: 1, cells: [
		{ name: 'footer', view: function(ui) {
			var odd = false;
			ui
				.padding(0,2)
				.interval(500)
				.line(function() {
					odd = !odd;
					return [(odd ? ' ' : '') +'(c) arghfbl']
				});
		}, canFocus: false }
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
		menu: function(ui) {
			ui
				.padding(1, 2)
				.margin(1, 2)
				.background('blue')
				.foreground('white')
				.input('Label: ', function(inputData) {

				})
				.option('Home page', function() {
					app.routeManager.openRoute('');
				})
				.option('Other page',function() {
					app.routeManager.openRoute('other-page');
				})
				.option('Quit',function() {
					process.exit();
				})
				.spacer()
				.paragraph('Use tab to move focus between shells, use arrows to move focus within a menu and confirm with return.')
		},
		content: function(ui) {

			ui
				.margin(1, 2)
				.h1('Home page of some sorts')
				.paragraph('Use the viewFactory to generate (rudimentary) UI elements. More UI is gonna be added. Did this text wrap already?')
				.spacer()
				.line('escape       Exit application')
				.line('ctrl+c       Exit application')
				.line('ctrl+q       Exit application')
				.line('tab          Focus on next ui')
				.line('shift+tab    Focus on previous ui')
				.line('ctrl+r       Redraw')
				.spacer()
				.h2('Menu ui')
				.line('down         Focus next menu item')
				.line('up           Focus previous menu item')
				.line('return       Select menu item');
		}
	},
	'other-page': {
		// Does not change 'menu' view
		content: function(ui) {
			var lastSubmitted = null;

			ui
				.padding(1, 2)
				.h1('The other page')

				.paragraph('This is the other page. It has a formatted paragraph and input fields :D', {
					bold: true
				})

				.spacer()

				.input('Regular:    ', function (data) {
					lastSubmitted = data;
					ui.render();
				})

				.input('Hidden:     ', function (data) {
					lastSubmitted = data;
					ui.render();
				}, { hidden: true })

				.spacer()

				.paragraph(function () {
					return ['Last submitted: ' + lastSubmitted];
				})
		}
	}
};

// appFactory eats both layout and route config. This may change in the future
// @TODO: Change in the future
var config = {
	layout: layout,
	routes: routes
};

var app = new interfais.appFactory(config);
app.init();