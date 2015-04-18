define(function (require) {
	var view = require('./view');
});
try {
	// running bundled
	var view = require('../app/view');	// kick off with almond.js
} catch (e) {
	// running in a browser
}
