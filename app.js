'use strict';

var config = require('./config'),
	partyPooper = require('party-pooper'),
	express = require('express'),
	app = express(),
	Busboy = require('busboy'),
	inspect = require('util').inspect,
	server;

app.set('view engine', 'jade');

server = app.listen(config.env, function() {
	var host = server.address().address,
	port = server.address().port;

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
		),
		firstparty = [];

	busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
		console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
		file.on('data', function(data) {
			console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
			fullData += data;
		});
		file.on('end', function() {
			console.log('File [' + fieldname + '] Finished');
			result = partyPooper.run(JSON.parse(fullData), firstparty);
			res.render('result', {
				'title': 'Third party pooper',
				'message': 'Gimmy all your HAR!',
				'result': result
			});
		});
	});
	busboy.on('field', function(fieldname, val) {
		console.log('Field [' + fieldname + ']: value: ' + inspect(val));
		if (fieldname === 'firstparty') {
			firstparty = val.split(/\r\n/);
		}
	});
	busboy.on('finish', function() {
		console.log('Done parsing form!');
	});
	req.pipe(busboy);
});
