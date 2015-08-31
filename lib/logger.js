var winston = require('winston'),
	fs = require('fs'),
	dir = './logs';

if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir);
}

var logger = new(winston.Logger)({
	transports: [
		new(winston.transports.DailyRotateFile)({
			name: 'file#verbose',
			level: 'verbose',
			filename: './logs/verbose.log',
			datePattern: '.yyyy-MM-dd'
		}),
		new(winston.transports.Console)({
			level: 'info',
			colorize: true,
			timestamp: true
		})
	]
});

exports.log = logger;
