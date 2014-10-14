var assert = require('assert'),
	RecursiveObject = require('../lib/classes/RecursiveObject');

describe('RecursiveObject', function () {
	var root = new RecursiveObject('root');

	it('can has children and grandchildren', function () {
		root
			.addChild(new RecursiveObject('level-a-1'))
			.addChild(new RecursiveObject('level-a-2'))
			.addChild((new RecursiveObject('level-a-3'))
				.addChild('level-b-1')
				.addChild('level-b-2')
		);

		assert.strictEqual(
			root.getChildren().length,
			3,
			'Root has 3 direct children'
		);

		assert.strictEqual(
			root.getChildren()[2].getChildren().length,
			2,
			'3rd child has 2 children itself'
		);
	});

	it('is aware of siblings', function () {
		var rootChild = new RecursiveObject('level-a-4');
		root.addChild(rootChild);

		assert.strictEqual(
			rootChild.getSiblings().length,
			3,
			'There are 3 other A levels'
		);

		assert.ok(
			rootChild.getSiblings().every(function(sibl) {
				return sibl.getParent() === rootChild.getParent();
			}),
			'All siblings have the same parent as new child'
		);

		assert.ok(
			rootChild.getSiblings().every(function(sibl) {
				return sibl !== rootChild;
			}),
			'An object is not listed among it\'s siblings'
		);
	});

	it('is aware of its lineage', function () {
		var deepChild = new RecursiveObject('level-z-4');

		root
			.addChild((new RecursiveObject())
				.addChild((new RecursiveObject())
					.addChild((new RecursiveObject())
						.addChild((new RecursiveObject())
							.addChild(deepChild)
						)
					)
				)
			);

		assert.strictEqual(
			deepChild.getParents().length,
			5,
			'Deep child is 6th generation'
		);

		assert.strictEqual(deepChild.getParent().getParent().getParent().getParent().getParent(),
			root,
			'The great-great-great-grand-dad is root'
		);

	});
});
