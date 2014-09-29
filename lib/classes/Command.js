var RecursiveObject = require('./RecursiveObject');

module.exports = Command;


/**
 *
 * @param {$string} name Must be unique among it's siblings
 * @param {$string} [description]
 * @param {Function} [callback] Execution callback, if executable. Can also be added with makeExecutable()
 * @constructor
 */
function Command(options, callback) {
	RecursiveObject.apply(this, arguments);

	if (!this.name)
		throw new Error('Command has no name');

	this._arguments = [];
	this._execute = null;

	this.makeExecutable(callback);
	return this;
}

Command.prototype = new RecursiveObject;

Command.prototype.toString = function () {
	return this.name;
}

/**
 *
 * @returns {boolean}
 */
Command.prototype.isExecutable = function () {
	return typeof this._execute === 'function';
};

/**
 *
 * @param {Function} [callback] Execution callback, if executable.
 */
Command.prototype.makeExecutable = function (callback) {
	this._execute = callback;
	return this;
};

function bindCliScopeToCommand(child) {
	var childName = child;

	if (child instanceof Command)
		return child.enter();

	if (childName == '..')
		if (this._parent)
			return this.getParent().enter();
		else
			console.log('You are already at root level');

	// If child command exists, enter it
	else
		console.log('"' + childName + '" doesnt exist.');

	this.enter();
}


function getArgument(name, validator, options) {
	if (typeof validator === 'object') {
		options = validator;
		validator = null;
	}

	if (!options)
		options = {};

	if (validator)
		options.conform = validator;

	options.name = name;

	return options;
};

Command.prototype.execute = function () {
	this._execute.apply(this, arguments);
};
