'use strict';

var config = require('./config'),
	express = require('express'),
	logger = require('./lib/logger.js').log,
	db = require('./lib/database.js'),
	app = express(),
	server,
	Promise = require('promise');

var FormHandler = require('./controllers/formHandler.js');
var Analyzer = require('./lib/analyze.js');
var renderResult = require('./lib/renderResult.js');


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

app.get('/results/:resultKey', function(req, res) {
	var resultKey = req.params.resultKey,
		analyzeObject = db.getResults(resultKey);

	res.render('result', {
		'title': 'Third party pooper',
		'message': 'Gimmy all your HAR!',
		'result': analyzeObject.thirdParty
	});
});

// routing: form submit from homepage
app.post('/formHandler', function(req, res) {
	var analyzeObject = {
		'server': {
			'request': req,
			'response': res
		}
	}

	FormHandler(analyzeObject)
		.then(Analyzer)
		.then(renderResult)
		.then(function(analyzeObject) {
			return new Promise(function(resolve, reject) {
				db.saveResults(analyzeObject);
				resolve(analyzeObject);
			});
		})
		.catch(function(e) {
			console.log(e); // "oh, no!"
		});
});
