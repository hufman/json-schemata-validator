define(['mithril', '../validation', '../deeplink'], function (m, v, deeplink) {

	var metaschema = m.request({method: "GET", url: "metaschema.json", background:true});

	var Schema = function(name, body) {
		this._name = "";
		this._body = "";
		this._schema = {	// the schema to valid self against
		                	// default to metaschema
			name: m.prop("http://json-schema.org/draft-04/schema#"),
			body: metaschema,
			valid: m.prop(true)
		};
		this._debounceBody = false;	// whether we are debouncing a body change
		this._valid = null;
		this.loading = m.prop(false);	// true,false
		this.error = m.prop(null);	// null,string,object
		this.missing = m.prop([]);	// an array of missing schemas
		this.supplementalSchemas = m.prop([]);
		this.body(body || "");
		this.name(name || "");
	};
	Schema.prototype = {
		name: function(name) {
			if (arguments.length > 0) {
				this._name = name;
				this.scheduleLoadSchema();
				deeplink.schedule();
				if (!this.empty()) {
					this.scheduleValidate(10);
				}
			}
			return this._name;
		},
		blurName: function() {
			if (this._debounceLoad) {
				window.clearTimeout(this._debounceLoad);
			}
			this.loadSchema();
		},
		body: function(body) {
			if (arguments.length > 0) {
				this._body = body;
				this.clearValidate();
				this.scheduleValidate();
				this._debounceBody = true;
				deeplink.schedule();
			}
			return this._body;
		},
		blurBody: function() {
			if (this._debounceValidate) {
				window.clearTimeout(this._debounceValidate);
			}
			this.validate();
		},
		empty: function() {
			return this._body === "";
		},
		schema: function(schema) {
			// set the active schema
			if (arguments.length > 0) {
				this._schema = schema;
				this.clearValidate();
				this.scheduleValidate();
			}
			return this._schema;
		},
		scheduleLoadSchema: function() {
			if (this._debounceLoad) {
				window.clearTimeout(this._debounceLoad);
			}
			this._debounceLoad = window.setTimeout(this.loadSchema.bind(this), 1700);
		},
		loadSchema: function() {
			if (this.name().indexOf('://') < 0 || this.body() != "") {
				return;
			}
			var self = this;
			var url = this.name();
			this.loading(true);
			m.request({
				method: "GET",
				url: url,
				deserialize: function(v){return v},
				background: true
			}).then(function(data) {
				self.loading(false);
				if (self.name() == url && self.body() == "") {	// user hasn't started typing
					self.body(data);
					self.blurBody();	// validate immediately
				}
				m.redraw();
			}, function(error) {
				self.loading(false);
				self.error(error);
				m.redraw();
			});
			m.redraw();
		},

		valid: function(valid) {
			// set whether this schema is valid
			// whenever it is read, it also checks the supplementary schemas
			if (arguments.length > 0) {
				this._valid = valid;
			} else {
				var allValid = true;
				for (var i=0; i < this.supplementalSchemas().length; i++) {
					if (this.supplementalSchemas()[i]._valid !== true &&
					    this.supplementalSchemas()[i].empty() !== true) {
						allValid = false;
						break;
					}
				}
				// none of the schemas are invalid
				if (! allValid) {
					this.clearValidate();
				}
				if (allValid && this._valid === null) {
					this.scheduleValidate(10);
				}
			}
			return this._valid;
		},
		scheduleValidate: function(delay) {
			if (this._debounceBody) { return; }
			delay = delay || 800;
			if (this._debounceValidate) {
				window.clearTimeout(this._debounceValidate);
			}
			this._debounceValidate = window.setTimeout(this.validate.bind(this), delay);
		},
		clearValidate: function() {
			this.valid(null);
			this.error(null);
			this.missing([]);
		},
		validate: function() {
			if (this._debounceValidate) {
				window.clearTimeout(this._debounceValidate);
			}
			this._debounceValidate = null;
			this._debounceBody = false;
			if (!metaschema()) {
				this.scheduleValidate();
				return;
			}
			if (this.empty()) {
				this.clearValidate();
				return;
			}

			this.missing([]);
			var valid = v.validate(this.supplementalSchemas(), this.schema(), this.body());
			if (valid === true) {		// validated
				this.valid(true);
				this.error(null);
			}
			else if (valid === null) {	// couldn't validate
				this.clearValidate();
				this.scheduleValidate();
			}
			else if (typeof(valid) === 'object' ||	// error object
			         typeof(valid) === 'string') {	// error string
				if (valid.hasOwnProperty('missing')) {
					this.missing(valid.missing)
				}
				if (valid.hasOwnProperty('valid')) {
					this.valid(valid.valid);
				} else {
					this.valid(false);
				}
				this.error(valid);
			}
			m.redraw();
		}
	};


	return {
		Schema: Schema
	};
});
