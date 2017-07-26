'use strict'

const hapi = require('hapi');
const config = require('config');
const log = require('util/logger');

log.fatal('##### Starting Hyper API #####');

// Create the Hapi Server and load the plugins
const server = new hapi.Server();
server.connection(config.get('server'));

let plugins = config.get('plugins').map(plugin => require(plugin));

server.register(plugins, (err) => {
    if (err) {
        log.fatal(err, 'Hapi failed to register plugins');
        throw (err);
    }

    log.info('All plugins were loaded successfuly');

    server.start((err) => {
        if (err) {
            log.fatal(err, 'Failed to start server');
            throw err;
        }

        log.info('Hyper-API is up and running on port %s', config.get('server').port);
    });
});