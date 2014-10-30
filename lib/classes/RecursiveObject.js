var ConfigurableObject = require('./ConfigurableObject');

/*
 * Conveinience object that can have more RecursiveObjects (or inheriting) in it.
 * @todo Make parent and children private, only available through getters and setters
 * @todo Method "removeChild" and possibly "removeParent"
 * @todo Review if making a chainable object is really what we want
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

/*
 * Returns whichever is defined first:
 *     own attribute,
 *     the parent getter for this attribute,
 *     the parent attribute,
 *     or its own attribute (undefined or whatever)
 * @note Overwrites the get() method on ConfigurableObject to be recursive
 * @param {String} attr
 * @param {Boolean} [noInherit]
 * @returns {*}
 */
RecursiveObject.prototype.get = function (attr, noInherit) {
	if (noInherit)
		return this[attr];

	return this[attr] || (this.parent && typeof this.parent.get == 'function' ? this.parent.get(attr, noInherit) : (this.parent ? this.parent[attr] : this[attr]));
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