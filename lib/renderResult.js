'use strict';

var logger = require('./logger.js').log;
var Promise = require('promise');

function renderResult(analyzeObject) {
	return new Promise(function(resolve, reject) {
		console.log('do we get here?');
		analyzeObject.server.response.render('result', {
			'title': 'Third party pooper',
			'message': 'Gimmy all your HAR!',
			'result': analyzeObject.thirdParty
		});

		resolve(analyzeObject);
	});
}

module.exports = renderResult;
