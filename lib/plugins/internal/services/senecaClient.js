'use strict'

const config = require('config');
const log = require('util/logger');

module.exports = {};

const seneca = require('seneca')(config.get('seneca').options)
    .use('seneca-amqp-transport', config.get('seneca').rabbitOptions);

module.exports.connect = function(callback) {
    seneca
        .client(config.get('seneca').client)
        .ready(function() {
            log.info('Connected to Hyper Services broker');
            return callback();
        })
        .error(function(error) {
            log.fatal('Failed to connect to rabbit broker!');
            return callback(error);
        });
};

module.exports.act = function(cmd, args, callback) {
    let start = process.hrtime();
    seneca.act(cmd, args, function(err, res) {
        let end = process.hrtime(start);
        log.trace(cmd, 'Execution time:', end[0], 's', end[1] / 1000000, 'ms');
        return callback(err, res);
    });
};