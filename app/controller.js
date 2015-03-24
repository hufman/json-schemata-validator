define(['mithril', './models/schema'], function (m, modelSchema) {
	var init = function() {};
	var metaschema = m.request({method: "GET", url: "metaschema.json", background:true});

	var schemas = [];
	var addSchema = function() {
		var newSchema = new modelSchema.Schema();
		schemas.push(newSchema);
		return newSchema;
	};
	addSchema();

	var setSchema = function(schema) {
		// set the data to use this schema as primary
		data.schema(schema);
	};

	var data = new modelSchema.Schema();
	data.supplementalSchemas = m.prop(schemas);	// automatically updating view
	setSchema(schemas[0]);		// first one is default

	return {
		init: init,
		schemas: schemas,
		addSchema: addSchema,
		setSchema: setSchema,
		data: data
	};
});
