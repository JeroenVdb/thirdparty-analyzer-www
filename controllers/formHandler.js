'use strict';

var Busboy = require('busboy'),
	Analyzer = require('./analyze.js');

function FormHandler(req, res) {
	var harData = '',
		busboy = new Busboy(
			{
				'headers': req.headers
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
			Analyzer(harData, firstPartyProviders, res);
		});
	});
	busboy.on('field', function(fieldname, val) {
		// console.log('Field [' + fieldname + ']: value: ' + inspect(val));
		if (fieldname === 'firstparty') {
			firstPartyProviders = val.split(/\r\n/);
			console.log(typeof firstPartyProviders);
		}
	});
	busboy.on('finish', function() {
		// console.log('Done parsing form!');
	});
	req.pipe(busboy);
}

module.exports = FormHandler;
