'use stict';

var database = [];

function databaseHelper() {

}

databaseHelper.saveResults = function(analyzeObject) {
	database.push(analyzeObject);

	console.log('Database:' + database.length);
};

databaseHelper.getResults = function(key) {
	var returnValue;

	database.forEach(function(elem) {
		console.log('found: ' + elem.key);

		if (key === elem.key) {
			returnValue = elem;
		}
	});

	return returnValue;
};

module.exports = databaseHelper;
