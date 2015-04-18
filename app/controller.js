define(['mithril', './schema', 'URI', './deeplink', './examples'], function (m, modelSchema, URI, deeplink, examples) {
	var init = function() {};
	var metaschema = m.request({method: "GET", url: "metaschema.json", background:true});

	var schemas = [];
	var addSchema = function(name) {
		if (name != null) {
			for (var i=0; i<schemas.length; i++) {
				if (name === schemas[i].name()) {
					return;   // this new schema already exists
				}
			}
		}
		var newSchema = new modelSchema.Schema();
		if (name != null) {
			newSchema.name(name);
			newSchema.blurName();	// start loading right away
		}
		schemas.push(newSchema);
		deeplink.schedule();
		return newSchema;
	};

	var removeSchema = function(schema) {
		var index = schemas.indexOf(schema);
		if (index > -1) {
			schemas.splice(index, 1);
		}
		if (schemas.length < 1) {
			addSchema();
		}
		if (schemas.indexOf(data.schema()) < 0) {
			data.schema(schemas[0]);
		}
		data.scheduleValidate(10);
	}
	var data = new modelSchema.Schema();
	data.supplementalSchemas = m.prop(schemas);	// automatically updating view

	// load up navigation
	var linkedState = deeplink.load();
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
		deeplink.schedule();
	};
	setSchema(schemas[0]);		// first one is default
	if (linkedState.index != null) {
		if (linkedState.index >= 0 && linkedState.index < schemas.length) {
			setSchema(schemas[linkedState.index]);
		}
	}

	// called by deeplink to fetch state
	var deeplinkSerialize = function() {
		var fakeSchemata = [];
		for (var s = 0; s < schemas.length; s++) {
			var newSchema = {
				name: schemas[s].name(),
				body: schemas[s].body()
			};
			fakeSchemata.push(newSchema);
		}
		var fakeData = {
			name: data.name(),
			body: data.body(),
		};
		return {
			'schemata': fakeSchemata,
			'data': fakeData,
			'index': schemas.indexOf(data.schema())
		};
	};

	// called by deeplink on page navigation
	var deeplinkDeserialize = function(serialized) {
		if (serialized.schemata && serialized.schemata.length) {
			schemas.length = 0;
			for (var s = 0; s < serialized.schemata.length; s++) {
				var newSchema = new modelSchema.Schema();
				newSchema.name(serialized.schemata[s].name);
				newSchema.body(serialized.schemata[s].body);
				newSchema.blurName();
				newSchema.blurBody();
				schemas.push(newSchema);
			}
		}
		if (serialized.data) {
			data.name(serialized.data.name);
			data.body(serialized.data.body);
			data.blurName();
			data.blurBody();
		}
		if (serialized.index) {
			if (serialized.index >= 0 && serialized.index < schemas.length) {
				data.schema(schemas[serialized.data[schema]]);
			}
		}
	};

	deeplink.registerSerializers(deeplinkSerialize, deeplinkDeserialize);

	return {
		init: init,
		schemas: schemas,
		addSchema: addSchema,
		setSchema: setSchema,
		removeSchema: removeSchema,
		data: data,
		deeplinkDeserialize: deeplinkDeserialize,
		examples: examples
	};
});
