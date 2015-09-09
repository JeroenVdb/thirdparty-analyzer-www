'use strict';

var HarHelper = require('./harHelper.js');
var partyPooper = require('party-pooper');
var pretty = require('prettysize');
var validUrl = require('valid-url');
var logger = require('./logger.js').log;
var Promise = require('promise');

function Analyze(analyzeObject) {
	return new Promise(function(resolve, reject) {

		var harData = analyzeObject.harData,
			harJson = HarHelper.getJsonHar(harData),
			firstPartyProviders = analyzeObject.firstPartyProviders,
			allEntries = [],
			thirdPartyEntries = [],
			thirdParty = [],
			firstPartyEntry = {
				'name': 'First Party'
			},
			results = [];

		// reset
		thirdParty = [];

		// get the entries/requests from the HAR file
		allEntries = HarHelper.getEntries(harJson);

		// filter empty lines and bad urls from user input
		firstPartyProviders = firstPartyProviders.filter(isValidUrl);
		// add first entry url to the list of first party urls, but don't add redirect urls
		firstPartyProviders.push(getRootDocumentUrl(allEntries));

		// set nicer name for our first party based on the url
		firstPartyEntry.name = getRootDocumentUrl(allEntries);

		logger.log('verbose', '----- START ANALYZING URLS ------');

		// check all request urls if they are firstparty
		allEntries.forEach(function(entry) {
			var isFirstParty = checkFirstParty(entry, firstPartyProviders);

			if (isFirstParty) {
				firstPartyEntry = addEntry(firstPartyEntry, entry);
			} else {
				thirdPartyEntries.push(entry);
			}
		});

		// check all remaining (thirdparty) entries
		thirdPartyEntries.forEach(function(entry) {
			logger.log('verbose', 'Analyze: ' + entry.request.url);
			checkThirdParty(entry, thirdParty);
		});

		results = thirdParty;
		results.push(firstPartyEntry);

		results.forEach(function(provider) {
			provider = calculateTotals(provider);
		});

		analyzeObject.results = results;
		analyzeObject.key = 'jeroen';

		resolve(analyzeObject);
	});
}

function checkFirstParty(entry, firstPartyProviders) {
	var url = entry.request.url,
		foundOne = false;

	firstPartyProviders.forEach(function(firstPartyUrl) {
		logger.log('verbose', 'checkFirstParty, compare to: ' + firstPartyUrl);

		if (url.indexOf(firstPartyUrl) > -1) {
			// firstParty = addEntry(firstParty, entry);
			// firstParty.entries.push(entry);

			logger.log('verbose', 'FOUND ONE: FIRSTPARTY');
			logger.log('verbose', 'This is a first party url');

			foundOne = true;

			return;
		}
	});

	if (!foundOne) {
		logger.log('verbose', 'This is NOT a first party url');
	}

	return foundOne;
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

function checkThirdParty(entry, thirdParty) {
	var url = entry.request.url,
		foundOne = false,
		provider;

	// first check if the entry isn't loaded by another thirdparty
	thirdParty.forEach(function(knownProvider) {
		knownProvider.entries.forEach(function(knownEntry) {
			logger.log('verbose', 'checkThirdParty referer, compare to: ' + knownEntry.request.url.substring(0, 50));

			if (getEntryReferer(entry) === knownEntry.request.url) {
				logger.log('verbose', 'FOUND ONE: REFERER');

				knownProvider = addEntry(knownProvider, entry);
				// knownProvider.entries.push(entry);
				foundOne = true;
				return true;
			}
		});
	});

	if (!foundOne) {
		provider = partyPooper.run(url);

		logger.log('verbose', 'Found a provider for this one: ' + provider.name);

		thirdParty.forEach(function(knownProvider) {
			if (provider.id === knownProvider.id) {
				logger.log('verbose', 'Provider' + provider.name + ' already existed, add it to the existing object');

				knownProvider = addEntry(knownProvider, entry);
				// knownProvider.entries.push(entry);
				foundOne = true;
				return true;
			}
		});

		if (!foundOne) {
			logger.log('verbose', 'Provider' + provider.name + ' didnt exist, add it new to the array');

			provider = addEntry(provider, entry);
			// provider.entries.push(entry);
			thirdParty.push(provider);
		}
	}
}

function addEntry(provider, entry) {
	if (typeof provider.entries === 'undefined') {
		provider.entries = [];
	}

	provider.entries.push(entry);

	return provider;
}

function calculateTotals(provider) {
	if (typeof provider.totals === 'undefined') {
		provider.totals = {};
	}

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

	return provider;
}

function isValidUrl(url) {
	if (url !== '') {
		return true;
	} else {
		return false;
	}
}

function getRootDocumentUrl(entries) {
	var i = 0;

	for (i = 0; i < entries.length; i++) {
		if (entries[i].response.status === 200) {
			logger.log('verbose', 'The root first party entry is: ' + entries[i].request.url);

			return entries[i].request.url;
		}
	}
}

module.exports = Analyze;
