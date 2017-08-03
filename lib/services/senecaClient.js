'use strict'

const config = require('config');
const log = require('util/logger');
const HyperError = require('hyper-error');
const Boom = require('boom');

module.exports = {};

// Connect to broker and configure the seneca client
const seneca = require('seneca')(config.get('seneca').options)
    .use('seneca-amqp-transport', config.get('seneca').rabbitOptions)
    .client(config.get('seneca').client)
    .ready(function() {
        log.info('Connected to Hyper Services broker');
    })

/**
 * Service act method
 */
module.exports.act = function(cmd, args, callback) {
    let start = process.hrtime();

    // Execute service call
    seneca.act(cmd, { data: args }, function(err, res) {
        console.log(res);
        let end = process.hrtime(start);

        // Benchamrk it
        log.trace(cmd, 'Execution time:', end[0], 's', end[1] / 1000000, 'ms');

        // If seneca error. Only timeout errors reach here, rest are fatal
        if (err) {
            log.error(err, 'Service error!');
            return callback(Boom.internal('Service timed out'));
        }

        // If an error comes from service
        if (res.err) {
            let error = HyperError.isHyperError(res.err) ? new HyperError(res.err).toBoom() : Boom.internal(res.err);
            return callback(error);
        }

        // Accepting data on both levels
        let data = (res && res.data) ? res.data : res;

        // If no errors were found, return the data        
        callback(res.data);
    });
};