'use strict';

var database = [];

function databaseHelper() {

}

databaseHelper.saveResults = function(analyzeObject) {
	var saveObject = {
		'key': 'jeroen1',
		'results': analyzeObject.results
	}

	database.push(saveObject);
};

databaseHelper.getResults = function(key) {
	var returnValue;

	database.forEach(function(elem) {
		if (key === elem.key) {
			returnValue = elem;
		}
	});

	return returnValue;
};

module.exports = databaseHelper;
