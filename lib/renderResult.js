'use strict';

var logger = require('./logger.js').log;
var Promise = require('promise');

function renderResult(analyzeObject) {
	return new Promise(function(resolve, reject) {
		analyzeObject.server.response.render('result', {
			'title': 'Third party pooper',
			'message': 'Gimmy all your HAR!',
			'result': analyzeObject.results
		});

		resolve(analyzeObject);
	});
}

module.exports = renderResult;
