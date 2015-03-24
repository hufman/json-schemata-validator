define(['tv4', 'URI'], function (tv4, URI) {
	var relativize = function(base, absolute) {
		return URI(absolute).relativeTo(base).toString();
	}

	/**
	Given a string containing json, parse it to an object
	Returns the object, or null if invalid
	*/
	var parseJSON = function(str, please_throw) {
		if (typeof(str) === "object") {
			return str;
		}
		try {
			var o = JSON.parse(str);
			if (o && typeof(o) === "object") {
				return o;
			}
		} catch (e) {
			if (please_throw) throw e;
		}
		return null;
	}

	/**
	Given a list of supplemental schemas and a primary schema and a data object
	Add the supplemental schemas to the validator by path, then
	Validate the data object against the schema
	Returns true if valid, or an error string if invalid
	Returns null if any of the schemas aren't valid
	*/
	var validate = function(supplemental, schema, data) {
		/*
		When passing in several supplemental schemas, the validator
		doesn't know the baseuri of the schema and so it can't
		resolve relative links.
		Each of the supplemental schemas, if possible, gets duplicated
		to the relative address relative to the schema's url
		*/

		var validator = tv4.freshApi();

		var base = schema.name();

		// load the supplemental schemas
		for (var index=0; index<supplemental.length; index++) {
			var supschema = supplemental[index];
			if (supschema.valid() !== true) { return null; }

			var path = supschema.name();
			var relpath = relativize(base, path);

			var schemadata = parseJSON(supschema.body());
			if (schemadata === null) { return null; }

			validator.addSchema(path, schemadata);
			validator.addSchema(relpath, schemadata);
			if (schemadata['id']) {
				validator.addSchema(schemadata['id'], schemadata);
			}
		}

		// load the primary schema
		if (schema.valid() !== true) { return null; }
		var schemadata = parseJSON(schema.body());
		if (schemadata === null) { return null; }
		if (schemadata['id']) {
			validator.addSchema(schemadata['id'], schemadata);
		}

		if (typeof(data) === "string" && data.trim().length == 0) {
			return null;
		}
		try {
			var parseddata = parseJSON(data, true);
		} catch (e) {
			return e.message;
		}

		var valid = validator.validate(parseddata, schemadata, true);
		if (valid === true) { return true; }
		if (valid === false) {
			return validator.error;
		}
	};

	return {validate:validate};
});
