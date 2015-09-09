var winston = require('winston'),
	fs = require('fs'),
	dir = './logs',
	config = require('./../config');

if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir);
}

var logger = new(winston.Logger)({
	transports: [
		new(winston.transports.Console)({
			level: 'info',
			colorize: true,
			timestamp: true
		})
	]
});

if (config.logger.verbose) {
	logger.add(winston.transports.DailyRotateFile, {
		name: 'file#verbose',
		level: 'verbose',
		filename: './logs/verbose.log',
		datePattern: '.yyyy-MM-dd'
	});
}

exports.log = logger;
