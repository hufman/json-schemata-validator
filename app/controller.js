define(['mithril', './models/schema'], function (m, modelSchema) {
	var init = function() {};

	var schemas = [];

	var addSchema = function() {
		var newSchema = new modelSchema.Schema();
		schemas.push(newSchema);
		return newSchema;
	};

	return {
		init: init,
		schemas: schemas,
		addSchema: addSchema
	};
});
