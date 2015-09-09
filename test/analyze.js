'use strict';

var expect = require('chai').expect,
	Analyzer = require('./../lib/analyze.js'),
	fs = require('fs'),
	Promise = require('promise');

describe('Thirdtparty Analyzer', function() {
	it('Thirdparty analyzer should find 20 providers analyzing demorgen', function() {
		var analyzeObject = {
			'harData': fs.readFileSync(__dirname + '/www.demorgen.be-30-06-2015.har', 'utf8'),
			'firstPartyProviders': []
		}

		analyzeObject = Analyzer(analyzeObject).then(function(analyzeObject) {
			expect(analyzeObject.results).to.have.length(20);
		}).catch(function(e) {
			console.log(e);
		});
	});
});

describe('Thirdtparty Analyzer', function() {
	it('Thirdparty analyzer should find 15 providers analyzing demorgen if firstparty providers are passed correctly', function() {
		var analyzeObject = {
			'harData': fs.readFileSync(__dirname + '/www.demorgen.be-30-06-2015.har', 'utf8'),
			'firstPartyProviders': ['static0.demorgen-cdn.be', 'static1.demorgen-cdn.be', 'static2.demorgen-cdn.be', 'static3.demorgen-cdn.be', 'static4.demorgen-cdn.be']
		}

		analyzeObject = Analyzer(analyzeObject).then(function(analyzeObject) {
			expect(analyzeObject.results).to.have.length(15);
		}).catch(function(e) {
			console.log(e);
		});
	});
});
