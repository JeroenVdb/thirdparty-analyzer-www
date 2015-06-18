'use strict';

var HarHelper = require('./harHelper.js');
var UrlHelper = require('./urlHelper.js');
var partyPooper = require('party-pooper');
var pretty = require('prettysize');
var validUrl = require('valid-url');
var winston = require('winston');

var firstParty = {
	'name': 'First Party',
	'entries': [],
	'totals': {}
}
var thirdParty = [];
var UnknownThirdParty =
	{
		'name': 'Unknown',
		'entries': [],
		'totals': {}
	};

function Analyze(harData, firstPartyProviders, response) {
	var harJson = JSON.parse(harData),
		entries = [];

	winston.log('info', 'firstPartyProviders is: ' + firstPartyProviders);
	winston.log('info', 'firstPartyProviders typeof is: ' + typeof firstPartyProviders);

	var thirdPartyEntries = [];

	entries = getEntries(harJson);

	// check if har file is valid
	if (!HarHelper.validateHar(harJson)) {
		console.error('Not a valid HAR file');
	}

	// add first entry url to the list of third party urls
	firstPartyProviders.push(entries[0].request.url);

	var validatedFirstPartyUrls = [];

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
		// var found = false;

		winston.log('info', 'Analyze: ' + entry.request.url);

		var contin = checkFirstParty(entry, validatedFirstPartyUrls);

		if (contin) {
			checkThirdParty(entry);
		}


		// if (isFirstPartyUrl(entry.request.url, firstPartyProviders)) {
		// 	firstParty.entries.push(entry);
		// } else {
		// 	var provider = partyPooper.run(entry.request.url);


		// 	thirdParty.forEach(function(party) {
		// 		console.log('Compare time!');
		// 		console.log(party.prev);
		// 		console.log(getEntryReferer(entry));
		// 		if (party.prev.indexOf(getEntryReferer(entry)) !== -1) {
		// 			console.log('I FOUND ONE !!!!!!!!');
		// 			console.log('in if');
		// 			party.entries.push(entry);
		// 			found = true;
		// 		}
		// 	});

		// 	if (provider && !found) {

		// 		thirdParty.forEach(function(party) {
		// 			if (party.id === provider.id) {
		// 				console.log('in else if');
		// 				party.entries.push(entry);
		// 				found = true;
		// 			}
		// 		});

		// 		if (!found) {
		// 			console.log('not found, add it: ' + provider.name);
		// 			provider.entries.push(entry);
		// 			provider.prev = [];
		// 			provider.prev.push(entry.request.url);
		// 			thirdParty.push(provider);
		// 		}

		// 	} else {
		// 		if (!found) {
		// 			var newEntry = {};
		// 			newEntry.id = entry.request.url;
		// 			newEntry.name = entry.request.url;
		// 			newEntry.totals = {};
		// 			newEntry.entries = [];
		// 			newEntry.entries.push(entry);
		// 			newEntry.prev = [];
		// 			newEntry.prev.push(entry.request.url);
		// 			thirdParty.push(newEntry);
		// 		}
		// 	}

		// 	// provider.entries.push(entry);
		// 	// provider.entries.push(getChildEntries(entries, entry));

		// 	// thirdPartyEntries.push(provider);

		// 	// console.log(thirdPartyEntries);
		// }
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
	for (var header in entry.request.headers) {
		if (entry.request.headers[header].name === 'Referer') {
			return entry.request.headers[header].value;
		}
	}

	return false;
}

function checkThirdParty(entry) {
	var url = entry.request.url,
		foundOne = false;

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

	var provider = partyPooper.run(url);

	if (provider && !foundOne) {

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
	} else {
		winston.log('info', 'Nothing found for this one, create a new entry');

		var newEntry = {};
		newEntry.id = entry.request.url;
		newEntry.name = entry.request.url;
		newEntry.totals = {};
		newEntry.entries = [];
		newEntry.entries.push(entry);
		thirdParty.push(newEntry);
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

module.exports = Analyze;
