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
		return m("input", attrs);
	};
	var errorMessage = function(error) {
		if (typeof(error) === "string") {	// general error
			return m("div.error", [error()]);
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
		  m("p", [
		    m("input", {
		      placeholder:"URL",
		      oninput: m.withAttr("value", schema.name.bind(schema)),
		      onblur: schema.blurName.bind(schema)
		    }),
		    schemaActiveRadio(schema),
		    schema.loading() ? "..." : null
		  ]),
		  m("textarea", {
		    cols:"80", rows:"10",
		    oninput: m.withAttr("value", schema.body.bind(schema)),
		    onblur: schema.blurBody.bind(schema)
		  }, schema.body()),
		  errorMessage(schema.error())
		]);
	};
	var view = function() {
		return [
		  m("div#schemas", [
		    m("h2", "Schemas"),
		    controller.schemas.map(renderSingleSchema)
		  ]),
		  m("button", {onclick: controller.addSchema}, ['Add']),
		  m("div#data", [
		    m("h2", "Data"),
		    renderSingleSchema(controller.data)
		  ])
		];
	};
	m.module(document.body, {controller:controller.init, view:view});
});
