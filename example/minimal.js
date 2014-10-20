(new require('../')({ layout: [
	[
		{
			canFocus: true,
			view: function (ui) {
				ui
					.margin(1, 2)
					.paragraph('Hello world!')
					.option('Quit', function () {
						process.exit();
					})
			}}
	]
]}));