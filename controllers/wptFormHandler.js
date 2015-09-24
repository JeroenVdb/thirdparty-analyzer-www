'use strict';

var Busboy = require('busboy');
var Promise = require('promise');

function FormHandler(analyzeObject) {
	return new Promise(function(resolve, reject) {
		var harData = '',
			busboy = new Busboy(
				{
					'headers': analyzeObject.server.request.headers
				}
			),
			firstPartyProviders = [],
			url;

		busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
			// console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
			file.on('data', function(data) {
				// console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
				if (fieldname === 'har') {
					harData += data;
				}
			});
			file.on('end', function() {
			});
		});
		busboy.on('field', function(fieldname, val) {
			// console.log('Field [' + fieldname + ']: value: ' + inspect(val));
			if (fieldname === 'firstparty') {
				firstPartyProviders = val.split(/\r\n/);
			}
			if (fieldname === 'url') {
				url = val;
				console.log('the url to send to WPT: ' + url);
			}
		});
		busboy.on('finish', function() {
			// console.log('Done parsing form!');
				analyzeObject.firstPartyProviders = firstPartyProviders;

				console.log('form submit end');
				resolve(analyzeObject);
		});
		analyzeObject.server.request.pipe(busboy);
	});
}

module.exports = FormHandler;
