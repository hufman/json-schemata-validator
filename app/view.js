define(['mithril', './controller'], function (m, controller) {
	var schemaClass = function(schema) {
		var val = schema.valid()
		if (val === true) return 'valid';
		if (val === false) return 'invalid';
		return '';
	};
	var schemaActiveRadio = function(schema) {
		if (schema === controller.data) return null;
		var attrs = {type: "radio", name: "activeSchema"};
		attrs['onclick'] = controller.setSchema.bind(this, schema);
		if (controller.data.schema() === schema) attrs['checked'] = 'checked';
		return m("label.radio-inline", [
		  m("input", attrs),
		  "Primary"
		]);
	};
	var errorMessage = function(error) {
		if (typeof(error) === "string") {	// general error
			return m("div.error", [error]);
		}
		if (typeof(error) === "object" && error !== null) {	// validation error
			return m("div.error", [
			  m("h4", [error.message]),
			  m("p", ["Data Path: ",error.dataPath]),
			  m("p", ["Schema Path: ",error.schemaPath])
			]);
		}
		return null;
	};
	var renderSingleSchema = function(schema) {
		return m("div.schema", {class: schemaClass(schema)}, [
		  m("p.form-group.form-inline", [
		    m("input.form-control", {
		      placeholder:"URL",
		      value: schema.name(),
		      oninput: m.withAttr("value", schema.name.bind(schema)),
		      onblur: schema.blurName.bind(schema)
		    }),
		    " ",  // spacer
		    schemaActiveRadio(schema),
		    schema.loading() ? " ..." : null
		  ]),
		  m("textarea.form-control", {
		    rows:"8",
		    oninput: m.withAttr("value", schema.body.bind(schema)),
		    onblur: schema.blurBody.bind(schema)
		  }, schema.body()),
		  errorMessage(schema.error())
		]);
	};
	var view = function() {
		return [
		  m("h1#title", ["JSON Schemata Validator"]),
		  m("div#container.row", [
		    m("div#schemas.col-md-6", [
		      m("h2", "Schemas"),
		      controller.schemas.map(renderSingleSchema),
		      m("button.btn.btn-default", {onclick: controller.addSchema}, ['Add Schema'])
		    ]),
		    m("div#data.col-md-6", [
		      m("h2", "Data"),
		      renderSingleSchema(controller.data)
		    ])
		  ])
		];
	};
	m.module(document.body, {controller:controller.init, view:view});
});
