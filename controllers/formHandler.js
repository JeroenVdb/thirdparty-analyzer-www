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
			firstPartyProviders = [];

		busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
			// console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
			file.on('data', function(data) {
				// console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
				if (fieldname === 'har') {
					harData += data;
				}
			});
			file.on('end', function() {
				analyzeObject.harData = harData;
				analyzeObject.firstPartyProviders = firstPartyProviders;

				resolve(analyzeObject);
			});
		});
		busboy.on('field', function(fieldname, val) {
			// console.log('Field [' + fieldname + ']: value: ' + inspect(val));
			if (fieldname === 'firstparty') {
				firstPartyProviders = val.split(/\r\n/);
			}
		});
		busboy.on('finish', function() {
			// console.log('Done parsing form!');
		});
		analyzeObject.server.request.pipe(busboy);
	});
}

module.exports = FormHandler;
