'use strict';

var logger = require('./logger.js').log;
var Promise = require('promise');
var path = require('path')
var childProcess = require('child_process')
var phantomjs = require('phantomjs')
var binPath = phantomjs.path



function wptData(analyzeObject) {
	return new Promise(function(resolve, reject) {

    // send request to WPT and wait for it
    var childArgs = [
      path.join(__dirname, './netsniff.js'),
      'http://www.jeroenvdb.be'
    ]

    console.log('going to send to phantomjs');

    childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
      if (err) {
        console.log('error');
        console.log(err);
      }

      analyzeObject.harData = stdout;
      console.log('we have stdout, will resolve');
      console.log(analyzeObject.harData);
      console.log('end of hardata -----');
		  resolve(analyzeObject);
    });

    // get harData and add it to analyzeObject

	});
}

module.exports = wptData;
