define(['tv4', 'URI'], function (tv4, URI) {
	var relativize = function(base, absolute) {
		return URI(absolute).relativeTo(base).toString();
	};

	var resolveRelative = function(base, relatives) {
		var relativeDict = {}
		relatives.forEach(function(relative) {
			relativeDict[relative] = URI(relative).absoluteTo(base).toString();
		});
		return relativeDict;
	};

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
	};

	/**
	Generates an error object to be returned by the validate function
	This one indicates that the data doesn't parse as json
	It will have a .message property with a string message for the user
	*/
	var errorJson = function(message) {
		return {
		  "error": "json",
		  "message": message
		};
	};

	/**
	Generates an error object to be returned by the validate function
	This one indicates that the schema references some missing schemata
	It will have a .missing property with an array of missing schema urls
	*/
	var errorMissing = function(missing, resolved, valid, error) {
		var ret = {
		  "error": "missing",
		  "missing": missing,
		  "resolved": resolved,
		  "valid": valid
		};
		if (error) {
			ret['result'] = error;
		}
		return ret
	};

	/**
	Generates an error object to be returned by the validate function
	This one indicates that the data doesn't validate against the schema
	It will have a .result object property with a the validation results
	*/
	var errorSchema = function(result) {
		return {
		  "error": "schema",
		  "result": result
		};
	};

	/**
	Given a list of supplemental schemas and a primary schema and a data object
	Add the supplemental schemas to the validator by path, then
	Validate the data object against the schema
	Returns true if valid, or an error object if invalid
	  An error object has a .error property saying what kind of error
	  It also has a .message string property for the user
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

		// load the supplemental schemas that the primary may need
		for (var index=0; index<supplemental.length; index++) {
			var supschema = supplemental[index];
			if (supschema.valid() === false) { return null; }
			if (supschema.valid() !== true) { continue; }

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

		// load the primary schema to validate against
		if (schema.valid() !== true) { return null; }
		var schemadata = parseJSON(schema.body());
		if (schemadata === null) { return null; }
		if (schemadata['id']) {
			validator.addSchema(schemadata['id'], schemadata);
		}

		// empty data, don't try to validate
		if (typeof(data) === "string" && data.trim().length == 0) {
			return null;
		}
		try {
			var parseddata = parseJSON(data, true);
		} catch (e) {
			return errorJson(e.message);
		}

		var valid = validator.validate(parseddata, schemadata, true);
		if (validator.missing.length > 0) {
			var missingDict = resolveRelative(base, validator.missing);
			return errorMissing(validator.missing, missingDict, valid, validator.error);
		}
		if (valid === true) { return true; }
		if (valid === false) {
			return errorSchema(validator.error);
		}
	};

	return {validate:validate};
});
