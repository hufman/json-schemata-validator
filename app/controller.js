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

	var loadDeeplink = function() {
		var ret = {'schemata': [], 'data': null};
		var parseURI = URI(window.location.href);
		var qsdata = parseURI.query(true);
		if (qsdata.schemata) {
			var splitted = qsdata.schemata.split(',');
			for (var s = 0; s < splitted.length; s++) {
				var suri = URI(URI.decode(splitted[s]));
				ret.schemata.push(suri.toString());
			}
		}
		if (qsdata.data) {
			var duri = URI(URI.decode(qsdata.data));
			ret.data=duri.toString();
		}
		return ret;
	}

	// load up navigation
	var linkedState = loadDeeplink();
	for (var s = 0; s < linkedState.schemata.length; s++) {
		var schema = addSchema();
		schema.name(linkedState.schemata[s]);
		schema.blurName();
	}
	if (linkedState.data) {
		data.name(linkedState.data);
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
