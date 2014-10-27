function ConfigurableObject (config) {
	if (typeof config === 'string')
		config = { name: config };

	for (var attr in config) {
		this[attr] = config[attr];
	}
}

ConfigurableObject.prototype.set = function (attrName, value) {
	if (typeof attrName === 'object') {
		for (var realAttrName in attrName)
			if (attrName.hasOwnProperty(realAttrName))
				this.set(realAttrName, attrName[realAttrName]);

		return this;
	}

	this[attrName] = value;

	return this;
};

ConfigurableObject.prototype.get = function (attrName) {
	return this[attrName];
};

module.exports = ConfigurableObject;