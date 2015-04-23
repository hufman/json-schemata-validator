define(['URI'], function(URI) {
	var abs = function(rel) {
		return URI(rel).absoluteTo(window.location.href).toString();
	};
	return [{
		'title': 'JSON-RPC',
		'schemata': [{
			'name': abs('examples/jsonrpc-request-schema.json')
		}],
		'data': {
			'name': abs('examples/jsonrpc-request-data.json')
		}
		},{
		'title': 'Geo Example',
		'schemata': [{
			'name': abs('examples/geo-schema.json'),
			'body': ''
		}],
		'data': {
			'name': abs('examples/geo-data.json'),
			'body': ''
		},
		'index': 0
	}];
});
