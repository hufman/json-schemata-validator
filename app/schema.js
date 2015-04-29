define(['mithril', './validation', './deeplink'], function (m, v, deeplink) {

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
		this._custom = false;		// whether the user has edited the data
		this.loading = m.prop(false);	// true,false
		this.error = m.prop(null);	// null,object
		this.fetchError = m.prop(null);	// null,string about fetch errors
		this.missing = m.prop([]);	// an array of missing schemas
		this.supplementalSchemas = m.prop([]);
		this.body(body || "");
		this._custom = false;		// preloaded data isn't going to be user custom
		this.name(name || "");
	};
	Schema.prototype = {
		name: function(name) {
			if (arguments.length > 0) {
				this._name = name;
				deeplink.schedule();
				if (!this.custom()) {
					this._body = '';
					this.clearValidate();
					this.scheduleLoadSchema();
				}
				if (this.custom()) {
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
				if (body != '') {
					this._custom = true;
				}
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
		remote: function() {
			return this.name().indexOf('://') >= 0;
		},
		custom: function() {
			// whether the user has changed the data
			return this._custom && !this.empty();
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
			if (!this.remote() || this.custom()) {
				return;
			}
			var self = this;
			var url = this.name();
			this.loading(true);
			this.fetchError(null);
			m.request({
				method: "GET",
				url: url,
				config: function(xhr) {
					xhr.setRequestHeader("Accept", "application/json");
				},
				deserialize: function(v){return v},
				extract: function(xhr, xhrOptions) {
					if (xhr.status > 200) {
						var error = "Server returned error " + xhr.status;
						// put the content in the box
						self._body = xhr.responseText;
						self.blurBody();	// validate immediately
						// show a fancy error message
						self.fetchError(error);
						return error;
					}
					return xhr.responseText;
				},
				background: true
			}).then(function(data) {
				self.loading(false);
				if (self.name() == url && !self.custom()) {	// user hasn't started typing
					self._body = data;
					self.blurBody();	// validate immediately
				}
				m.redraw();
			}, function(error) {
				self.loading(false);
				self.fetchError(error);
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
					     (this.supplementalSchemas()[i].empty() !== true ||
					      this.supplementalSchemas()[i].loading())) {
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
			this.fetchError(null);
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
			else if (typeof(valid) === 'object') {	// error object
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
