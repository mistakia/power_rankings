/* global require, module */

var fs = require('fs');

var config;
var config_file = '/home/deploy/apps.json';

if (fs.existsSync(config_file)) {

    config = JSON.parse(fs.readFileSync(config_file));

} else {

    config = {
	log: {
	    level: 'debug'
	}
    };
}

if (!config) {
    throw new Error('Application config missing');
}

module.exports = config;
