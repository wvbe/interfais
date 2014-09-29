var util = require('util'),
	ConfigurableObject = require('./ConfigurableObject');

/**
 * Conveinience object that can have more RecursiveObjects (or inheriting) in it.
 * @todo Make parent and children private, only available through getters and setters
 * @todo Method "removeChild" and possibly "removeParent"
 * @returns {RecursiveObject}
 * @constructor
 */
function RecursiveObject(options) {
	ConfigurableObject.apply(this, arguments);

	this.parent = null;
	this.children = [];
	return this;
}

var configurableObject = new ConfigurableObject;
RecursiveObject.prototype = configurableObject;

/**
 * Returns whichever is defined first: own attribute, the parent getter for this attribute, the parent attribute, or its own attribute (undefined or whatever)
 * @param attr
 * @param noInherit
 * @returns {*}
 */
RecursiveObject.prototype.get = function (attr, noInherit) {
	if (noInherit)
		return this[attr];

	return this[attr] || (this.parent && typeof this.parent.get == 'function' ? this.parent.get(attr, noInherit) : (this.parent ? this.parent[attr] : this[attr]));
};
/**
 * @todo Probably remove this
 * @returns {string}
 */
RecursiveObject.prototype.toString = function () {
	return util.inspect(this, {
		colors: true,
		depth: 4
	});
};

/**
 * @returns {Boolean}
 */
RecursiveObject.prototype.hasParent = function () {
	return !!this.parent;
};

/**
 * @returns {ConfigurableObject}
 */
RecursiveObject.prototype.getParent = function () {
	return this.parent;
};
/**
 * @param {ConfigurableObject} parent
 * @returns {ConfigurableObject} self
 */
RecursiveObject.prototype.setParent = function (parent) {
	this.parent = parent;
	return this;
};


/**
 * @returns {Array.<ConfigurableObject>}
 */
RecursiveObject.prototype.getParents = function () {
	var parents = [],
		root = this;

	while ((root = root.getParent()) && parents.length < 100) {
		parents.unshift(root);
	}
	return parents;
};

/**
 * @returns {Array.<ConfigurableObject>}
 */
RecursiveObject.prototype.getSiblings = function () {
	var self = this;
	return this.parent ? (this.parent.children || []).filter(function (sibling) {
		return sibling !== self;
	}) : [];
};

/**
 * @param {ConfigurableObject} child
 * @returns {Boolean}
 */
RecursiveObject.prototype.hasChild = function (child) {
	return this.children.indexOf(child) >= 0;
};

/**
 * @returns {Array.<ConfigurableObject>}
 */
RecursiveObject.prototype.getChildren = function () {
	return this.children;
};

/**
 * @param {ConfigurableObject} child
 * @returns {ConfigurableObject} self
 */
RecursiveObject.prototype.addChild = function (child) {
	this.children.push(child);

	if (typeof child.setParent == 'function')
		child.setParent(this);

	return this;
};

module.exports = RecursiveObject;