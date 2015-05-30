'use strict';

var pp = require('party-pooper'),
	express = require('express'),
	app = express(),
	Busboy = require('busboy'),
	inspect = require('util').inspect;

var server;

app.set('view engine', 'jade');

server = app.listen(3000, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});

app.get('/', function(req, res) {
	res.render('index', {
		'title': 'Third party pooper',
		'message': 'Gimmy all your HAR!',
		'submit': 'Send'
	});
});

app.post('/harpost', function(req, res) {
	var fullData = '',
		result = {},
		busboy = new Busboy(
			{
				'headers': req.headers
			}
		);

	busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
		console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
		file.on('data', function(data) {
			console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
			// console.log(data);
			fullData += data;
		});
		file.on('end', function() {
			console.log('File [' + fieldname + '] Finished');
			// console.log(fullData);
			// res.writeHead(303, { Connection: 'close', Location: '/' });
			// console.log(fullData);
			result = pp.run(JSON.parse(fullData), ['demorgen-cdn.be', 'demorgen.be']);
			res.render('result', {
				'title': 'Third party pooper',
				'message': 'Gimmy all your HAR!',
				'result': result
			});
		});
	});
	busboy.on('field', function(fieldname, val) {
		console.log('Field [' + fieldname + ']: value: ' + inspect(val));
	});
	busboy.on('finish', function() {
		console.log('Done parsing form!');
	});
	req.pipe(busboy);
});
