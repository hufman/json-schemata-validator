define(['mithril', './models/schema', 'URI'], function (m, modelSchema, URI) {
	var init = function() {};
	var metaschema = m.request({method: "GET", url: "metaschema.json", background:true});

	var schemas = [];
	var addSchema = function(name) {
		if (name !== null) {
			for (var i=0; i<schemas.length; i++) {
				if (name === schemas[i].name()) {
					return;   // this new schema already exists
				}
			}
		}
		var newSchema = new modelSchema.Schema();
		if (name !== null) {
			newSchema.name(name);
		}
		schemas.push(newSchema);
		return newSchema;
	};

	var data = new modelSchema.Schema();
	data.supplementalSchemas = m.prop(schemas);	// automatically updating view

	// load up navigation
	var parseURI = URI(window.location.href);
	var qsdata = parseURI.query(true);
	if (qsdata.schemata) {
		var splitted = qsdata.schemata.split(',');
		for (var s = 0; s < splitted.length; s++) {
			var suri = URI(URI.decode(splitted[s]));
			var schema = addSchema();
			schema.name(suri.toString());
			schema.blurName();
		}
	}
	if (qsdata.data) {
		var duri = URI(URI.decode(qsdata.data));
		data.name(duri.toString());
	}

	if (schemas.length < 1) {
		// start with a blank one by default
		addSchema();
	}

	// set the data's primary schema
	var setSchema = function(schema) {
		// set the data to use this schema as primary
		data.schema(schema);
	};
	setSchema(schemas[0]);		// first one is default

	return {
		init: init,
		schemas: schemas,
		addSchema: addSchema,
		setSchema: setSchema,
		data: data
	};
});
