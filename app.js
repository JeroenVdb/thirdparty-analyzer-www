'use strict';

var config = require('./config'),
	express = require('express'),
	app = express(),
	server;

var FormHandler = require('./controllers/formHandler.js');

// use Jade as templating engine
app.set('view engine', 'jade');

// basic server configuration
server = app.listen(config.port, function() {
	var host = server.address().address,
	port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
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
