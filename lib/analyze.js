'use strict';

var HarHelper = require('./harHelper.js');
var partyPooper = require('party-pooper');
var pretty = require('prettysize');
var validUrl = require('valid-url');
var winston = require('winston');

var firstParty = {
		'name': 'First Party',
		'entries': [],
		'totals': {}
	},
	thirdParty = [];

function Analyze(harData, firstPartyProviders, response) {
	var harJson = JSON.parse(harData),
		entries = [],
		validatedFirstPartyUrls = [];

	// reset
	thirdParty = [];

	winston.log('info', 'firstPartyProviders is: ' + firstPartyProviders);
	winston.log('info', 'firstPartyProviders typeof is: ' + typeof firstPartyProviders);

	entries = getEntries(harJson);

	// check if har file is valid
	if (!HarHelper.validateHar(harJson)) {
		console.error('Not a valid HAR file');
	}

	// add first entry url to the list of first party urls, but don't add redirect urls
	validatedFirstPartyUrls.push(getDocumentUrl(entries));

	winston.log('info', 'First Party urls are: ' + firstPartyProviders.join(', '));

	// check if all provided first party urls are valid
	firstPartyProviders.forEach(function(url) {
		winston.log('info', 'Validate first party url: ' + url);
		if (validateFirstPartyUrls(url)) {
			validatedFirstPartyUrls.push(validateFirstPartyUrls(url));
		}
	});

	winston.log('info', 'Validated First Party urls are: ' + validatedFirstPartyUrls.join(', '));

	winston.log('info', '----- START ANALYZING URLS');

	// check all request urls
	entries.forEach(function(entry) {
		var contin = checkFirstParty(entry, validatedFirstPartyUrls);

		winston.log('info', 'Analyze: ' + entry.request.url);

		if (contin) {
			checkThirdParty(entry);
		}
	});

	// thirdParty.push(UnknownThirdParty);
	thirdParty.push(firstParty);

	thirdParty.forEach(function(provider) {
		calculateTotals(provider);
	});

	response.render('result', {
		'title': 'Third party pooper',
		'message': 'Gimmy all your HAR!',
		'result': thirdParty
	});
}

function getEntries(harJson) {
	return harJson.log.entries;
}

function checkFirstParty(entry, aFirstParty) {
	var url = entry.request.url,
		foundOne = false;

	aFirstParty.forEach(function(firstPartyUrl) {
		winston.log('info', 'checkFirstParty, compare to: ' + firstPartyUrl);

		if (url.indexOf(firstPartyUrl) > -1) {
			firstParty.entries.push(entry);

			winston.log('info', 'FOUND ONE: FIRSTPARTY');
			winston.log('info', 'This is a first party url');

			foundOne = true;

			return;
		}
	});

	if (!foundOne) {
		winston.log('info', 'This is NOT a first party url');
	}

	return !foundOne;
}

function getEntryReferer(entry) {
	var header;

	for (header in entry.request.headers) {
		if (entry.request.headers[header].name === 'Referer') {
			return entry.request.headers[header].value;
		}
	}

	return false;
}

function checkThirdParty(entry) {
	var url = entry.request.url,
		foundOne = false,
		provider;

	// first check if the entry isn't loaded by another thirdparty
	thirdParty.forEach(function(knownProvider) {
		knownProvider.entries.forEach(function(knownEntry) {
			winston.log('info', 'checkThirdParty referer, compare to: ' + knownEntry.request.url.substring(0, 50));

			if (getEntryReferer(entry) === knownEntry.request.url) {
				winston.log('info', 'FOUND ONE: REFERER');

				knownProvider.entries.push(entry);
				foundOne = true;
				return true;
			}
		});
	});

	if (!foundOne) {
		provider = partyPooper.run(url);

		winston.log('info', 'Found a provider for this one: ' + provider.name);

		thirdParty.forEach(function(knownProvider) {
			if (provider.id === knownProvider.id) {
				winston.log('info', 'Provider' + provider.name + ' already existed, add it to the existing object');

				knownProvider.entries.push(entry);
				foundOne = true;
				return true;
			}
		});

		if (!foundOne) {
			winston.log('info', 'Provider' + provider.name + ' didnt exist, add it new to the array');

			provider.entries.push(entry);
			thirdParty.push(provider);
		}
	}
}

function calculateTotals(provider) {
	provider.totals.timings = 0;
	provider.totals.requests = 0;
	provider.totals.content = {
		'size': 0
	};

	provider.entries.forEach(function(entry) {
		provider.totals.timings += parseInt(entry.time, 10);
		provider.totals.content.size += parseInt(entry.response.content.size, 10);
	});

	provider.totals.content.size = pretty(provider.totals.content.size);

	provider.totals.requests = provider.entries.length;
}

function validateFirstPartyUrls(url) {
	if (!validUrl.is_web_uri(url)) {
		winston.log('error', 'Invalid first party urls');
	} else {
		return url;
	}
}

function getDocumentUrl(entries) {
	var i = 0;

	for (i = 0; i < entries.length; i++) {
		if (entries[i].response.status === 200) {
			winston.log('info', 'The root first party entry is: ' + entries[i].request.url);

			return entries[i].request.url;
		}
	}
}

module.exports = Analyze;
