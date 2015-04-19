define(['URI'], function (URI) {
	var serializers = {};
	var scheduleTimer = null;

	var loadDeeplink = function() {
		var ret = {'schemata': [], 'data': null, 'index': 0};
		var parseURI = URI(window.location.href);
		var qsdata = parseURI.query(true);
		if (qsdata.schemata) {
			if (!Array.isArray(qsdata.schemata)) {
				qsdata.schemata = [qsdata.schemata];
			}
			ret.schemata = qsdata.schemata;
		}
		if (qsdata.data) {
			if (Array.isArray(qsdata.data)) {
				qsdata.data = qsdata.data[0];
			}
			ret.data = qsdata.data;
		}
		if (qsdata.index) {
			if (Array.isArray(qsdata.index)) {
				qsdata.index = qsdata.index[0];
			}
			ret.index = parseInt(qsdata.index);
		}
		return ret;
	};

	var encodeDeeplink = function(serialized) {
		var tempURI = URI(window.location.href);
		var qsdata = {
			'schemata': serialized.schemata.map(function(a){return a.name}),
			'data': serialized.data.name,
			'index': serialized.index
		}
		// trim extra
		if (serialized.schemata.length < 1) {
			delete qsdata['schemata'];
		}
		if (serialized.schemata.length == 1 &&
		    serialized.schemata[0].name == '') {
			delete qsdata['schemata'];
		}
		if (serialized.data.name == '') {
			delete qsdata['data'];
		}
		if (typeof(serialized.index) !== 'undefined' &&
		    serialized.index < 1) {
			delete qsdata['index'];
		}
		tempURI.search("");
		tempURI.setSearch(qsdata);
		return tempURI.toString();
	};

	var scheduleDeeplink = function() {
		window.clearTimeout(scheduleTimer);
		scheduleTimer = window.setTimeout(saveDeeplink, 200);
	};

	var saveDeeplink = function() {
		if (! serializers.serializer) {
			scheduleDeeplink();
			return;
		}
		var lastData = loadDeeplink();
		var curData = serializers.serializer();
		var pushing = lastData.schemata.length != curData.schemata.length;
		var deeplink = encodeDeeplink(curData);

		var snapshot = pushing ? history.pushState : history.replaceState;
		snapshot = snapshot.bind(history);

		try {
			snapshot(curData, '', deeplink);
		} catch (e) {
			var smallData = {
				'schemata': curData.schemata.map(function(a){return {'name':a.name}}),
				'data': {'name':curData.data.name},
				'index': curData.index
			};
			snapshot(smallData, '', deeplink);
		};
	};

	var registerSerializers = function(serializer, deserializer) {
		serializers.serializer = serializer;
		serializers.deserializer = deserializer;
	};

	window.addEventListener('popstate', function(e) {
		if (serializers.deserializer && e.state) {
			serializers.deserializer(e.state);
		}
	});

	return {
		'load': loadDeeplink,
		'schedule': scheduleDeeplink,
		'registerSerializers': registerSerializers
	}

});
