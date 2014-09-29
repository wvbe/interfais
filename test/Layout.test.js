var assert = require('assert'),
	Layout = require('../lib/classes/Layout'),
	Row = require('../lib/classes/Row'),
	Cell = require('../lib/classes/Cell');
/**
 * @todo add (fluid) row height tests
 */
describe('Layout', function () {

	var hardsizedCell = (new Cell({width: 40}));
	var softsizedCells = [(new Cell()), (new Cell()), (new Cell())];

	var row = (new Row({height: 1}))
		.addChild(hardsizedCell)
		.addChild(softsizedCells[0])
		.addChild(softsizedCells[1])
		.addChild(softsizedCells[2]);

	var layout = (new Layout({
		width: 100,
		height: 75
	})).addChild(row);

	layout.prerender();

	it('layout is the given size', function () {
		assert.strictEqual(layout.prerendered.width, 100, 'In width');
		assert.strictEqual(layout.prerendered.height, 75, 'In height');
	});
	it('can take hardcoded row heights and cell widths', function () {
		assert.strictEqual(row.prerendered.height, 1, 'Row is exactly one in height');
		assert.strictEqual(hardsizedCell.prerendered.width, 40, 'Cell is exactly 40 wide');
	});

	it('can divide up the rest between siblings that are not hardcoded in size', function () {
		assert.ok(softsizedCells.every(function(cell) {
			return cell.prerendered.width === 20;
		}), 40, 'Ues');
	});

});