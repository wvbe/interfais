function FocusableObject(config) {

}

FocusableObject.prototype.set = function (attrName, value) {
	if (typeof attrName === 'object') {
		for (var realAttrName in attrName)
			if (attrName.hasOwnProperty(realAttrName))
				this.set(realAttrName, attrName[realAttrName])
		return this;
	}

	this[attrName] = value;
	return this;
};

FocusableObject.prototype.get = function (attrName) {
	return this[attrName];
};

module.exports = FocusableObject;