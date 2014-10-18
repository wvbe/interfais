/***
 * Example application for INTERFAIS
 */

var INTERFAIS = require('../'),
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
var app = new INTERFAIS({
	layout: [

		// Header row with the toolbar cell
		{ height: 1, cells: [
			{ name: 'header', view: function (ui) {
				ui
					.padding(0, 2)
					.background('white')
					.foreground('black')
					.line('EXAMPLE INTERFAIS ' + packageJson.version)
			}}
		]},

		// Body row, with the menu and content cells
		{ cells: [
			{ name: 'menu', width: 32, canFocus: true },
			{ name: 'content', canFocus: true }
		]},

		// Footer cell (with the footer view, which is unnamed thus cannot be routed)
		{ height: 1, cells: [
			{ name: 'footer', view: function (ui) {
				var odd = false;
				ui
					.padding(0, 2)
					.interval(500)
					.line(function () {
						odd = !odd;
						return [(odd ? ' ' : '') + '(c) arghfbl']
					});
			}, canFocus: false }
		]}
	]
});

/***
 * Routes
 * ------
 * Handled by routeManager, is a very simple key/value pair of route name vs. a list of views per named(!) Cell.
 * - Cannot be configured through the INTERFAIS constructor as of v1.0.0
 */
app.routeManager.registerRoute('', {
	menu: function (ui) {
		ui
			.padding(1, 2)
			.margin(1, 2)
			.background('blue')
			.foreground('white')
			.input('Label: ', function (inputData) {

			})
			.option('Home page', function () {
				app.routeManager.openRoute('');
			})
			.option('Other page', function () {
				app.routeManager.openRoute('other-page');
			})
			.option('Quit', function () {
				process.exit();
			})
			.spacer()
			.paragraph('Use tab to move focus between shells, use arrows to move focus within a menu and confirm with return.')
	},
	content: function (ui) {

		ui
			.margin(1, 2)
			.h1('Home page of some sorts')
			.paragraph('These are "global" key combo\'s, they should always work:')
			.spacer()
			.keyValue({
				'escape': 'Exit application',
				'ctrl+c': 'Exit application',
				'ctrl+q': 'Exit application',
				'tab': 'Focus on next ui',
				'shift+tab': 'Focus on previous ui',
				'ctrl+r': 'Redraw'
			})
			.spacer()
			.paragraph('The following keys work only on the part of the screen that is highlighted, and may not always be applicable:')
			.spacer()
			.keyValue({
				'down': 'Focus next menu item',
				'up': 'Focus previous menu item',
				'return': 'Select menu item',
				'shift+up': 'Scroll up',
				'shift+down': 'Scroll down'
			})
	}
});


app.routeManager.registerRoute('other-page', {
	// Does not change 'menu' view
	content: function (ui) {
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
});

app.routeManager.openRoute('');
