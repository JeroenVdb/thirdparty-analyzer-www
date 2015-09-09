'use strict';

var config = {};

/*eslint-disable */
config.env = process.env.NODE_ENV || 3000;
config.port = process.env.PORT || 3000;
config.logger = {
	'verbose': process.env.LOGVERBOSE || true
}
/*eslint-enable */

module.exports = config;
