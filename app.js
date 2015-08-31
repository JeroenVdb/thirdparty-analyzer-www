'use strict';

var config = require('./config'),
	express = require('express'),
	logger = require('./lib/logger.js').log,
	app = express(),
	server;

var FormHandler = require('./controllers/formHandler.js');

// use Jade as templating engine
app.set('view engine', 'jade');

// basic server configuration
server = app.listen(config.port, function() {
	var host = server.address().address,
	port = server.address().port;

	logger.log('info', 'Thirdparty Anayzer started at http://' + host + ':' + port);
	logger.log('verbose', 'Thirdparty Anayzer started at http://' + host + ':' + port);
});

app.use(express.static(__dirname + '/public'));

// routing: homepage
app.get('/', function(req, res) {
	res.render('index', {
		'title': 'Thirdparty Analyzer',
		'message': 'Gimmy all your HAR!',
		'submit': 'Send'
	});
});

// routing: form submit from homepage
app.post('/formHandler', FormHandler);
