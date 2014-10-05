function FocusableObject(name) {
	this.getName = typeof name === 'function' ? name : function() { return name; };

};

FocusableObject.prototype.blur = function () {};
FocusableObject.prototype.focus = function () {};
FocusableObject.prototype.enter = function() {};
FocusableObject.prototype.escape = function() {};
FocusableObject.prototype.confirm = function() {};

module.exports = FocusableObject;