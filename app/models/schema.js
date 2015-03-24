define(['mithril', '../validation'], function (m, v) {

	var metaschema = m.request({method: "GET", url: "metaschema.json", background:true});

	var Schema = function(name, body) {
		this._name = "";
		this._body = "";
		this.loading = m.prop(false);	// true,false
		this.error = m.prop(null);	// null,string
		this.valid = m.prop(null);	// true,false,null
		this.body(body || "");
		this.name(name || "");
	};
	Schema.prototype = {
		name: function(name) {
			if (arguments.length > 0) {
				this._name = name;
				this.scheduleLoadSchema();
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
				this.valid(null);
				this.scheduleValidate();
			}
			return this._body;
		},
		blurBody: function() {
			if (this._debounceValidate) {
				window.clearTimeout(this._debounceValidate);
			}
			this.validate();
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

		scheduleValidate: function() {
			if (this._debounceValidate) {
				window.clearTimeout(this._debounceValidate);
			}
			this._debounceValidate = window.setTimeout(this.validate.bind(this), 800);
		},
		validate: function() {
			if (!metaschema()) {
				this.scheduleValidate();
				return;
			};

			var fakeMetaSchema = {
				name: m.prop("http://json-schema.org/draft-04/schema#"),
				body: metaschema,
				valid: m.prop(true)
			};
			var valid = v.validate([], fakeMetaSchema, this.body());
			if (valid === true) {
				this.valid(true);
				this.error(null);
			}
			if (valid === null) {
				this.valid(null);
				this.error(null);
			}
			if (typeof(valid) === 'string') {
				this.valid(false);
				this.error(valid)
			}
			m.redraw();
		}
	};


	return {
		Schema: Schema
	};
});
