'use strict';

var url = require('url');

function urlHelper() {

}

urlHelper.validateUrl = function(firstPartyUrl) {
	console.log(firstPartyUrl);
	console.log(url.parse(firstPartyUrl));
	return true;
};

module.exports = urlHelper;
