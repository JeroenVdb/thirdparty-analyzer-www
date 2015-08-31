'use strict';

var logger = require('./logger.js').log;

function HarHelper() {

}

HarHelper.getJsonHar = function(harData) {
	return JSON.parse(harData);
};

HarHelper.getEntries = function(harJson) {
	return harJson.log.entries;
};

HarHelper.getRootDocumentUrl = function(entries) {
	var i = 0;

	for (i = 0; i < entries.length; i++) {
		if (entries[i].response.status === 200) {
			logger.log('verbose', 'The root first party entry is: ' + entries[i].request.url);

			return entries[i].request.url;
		}
	}
};

module.exports = HarHelper;
