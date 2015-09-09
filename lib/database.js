'use strict';

var database = [];

function databaseHelper() {

}

databaseHelper.saveResults = function(analyzeObject) {
	database.push(analyzeObject);
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
