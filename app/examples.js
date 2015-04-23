define(['URI'], function(URI) {
	var abs = function(rel) {
		return URI(rel).absoluteTo(window.location.href).toString();
	};
	return [{
		'title': 'RFC 3339 Timestamp',
		'schemata': [{
			'name': abs('examples/rfc3339-schema.json')
		}],
		'data': {
			'name': abs('examples/rfc3339-data.json')
		}
		},{
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
