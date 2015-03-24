define(['mithril', './controller'], function (m, controller) {
	var schemaClass = function(schema) {
		var val = schema.valid()
		if (val === true) return 'valid';
		if (val === false) return 'invalid';
		return '';
	};
	var renderSingleSchema = function(schema) {
		return m("div.schema", {class: schemaClass(schema)}, [
		  m("input", {
		    placeholder:"URL",
		    oninput: m.withAttr("value", schema.name.bind(schema)),
		    onblur: schema.blurName.bind(schema)
		  }),
		  schema.loading() ? "..." : null,
		  m("br"),
		  m("textarea", {
		    cols:"80", rows:"20",
		    oninput: m.withAttr("value", schema.body.bind(schema)),
		    onblur: schema.blurBody.bind(schema)
		    }, schema.body()),
		  schema.error() ? m("div.error", [schema.error()]) : null
		]);
	};
	var view = function() {
		return [
		  m("div#schemas", controller.schemas.map(renderSingleSchema)),
		  m("button", {onclick: controller.addSchema}, ['Add'])
		];
	};
	m.module(document.body, {controller:controller.init, view:view});
});
