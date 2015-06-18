'use strict';

var config = require('./config'),
	partyPooper = require('party-pooper'),
	express = require('express'),
	app = express(),
	Busboy = require('busboy'),
	inspect = require('util').inspect,
	server;

var FormHandler = require('./controllers/formHandler.js');

// use Jade as templating engine
app.set('view engine', 'jade');

// basic server configuration
server = app.listen(config.env, function() {
	var host = server.address().address,
	port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});

// routing: homepage
app.get('/', function(req, res) {
	res.render('index', {
		'title': 'Thirdparty Analyzer',
		'message': 'Gimmy all your HAR!',
		'submit': 'Send'
	});
});


// routing: form submit from homepage
app.post('/analyze', FormHandler);
