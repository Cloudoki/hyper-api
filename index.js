'use strict'

const hapi = require('hapi');
const hapiSwagger = require('hapi-swagger');
const mq = require('hyper-queue');
const inert = require('inert');
const vision = require('vision');

const config = require('config');
const log = require('log');
const pkgJson = require('./package');

log.fatal('##### Starting Hyper API #####');

mq.logger(log);

mq.broker(config.queue.uri, config.queue.options, config.queue.reconnect);

mq.connect();

// Create the Hapi Server and configure
// the static file server part

const server = new hapi.Server()

server.connection({
    port: config.port,
    routes: {
        cors: {
            origin: ['*'],
            additionalHeaders: ["Accept", "Authorization", "Content-Type", "If-None-Match", "Accept-language"]
        }
    }
})

let plugins = [
    // Register the users handling plugin
    {
        register: require('./lib/plugins/users/index.js'),
        routes: {
            prefix: '/api/v1'
        }
    },
    {
        register: require('./lib/plugins/accounts/index.js'),
        routes: {
            prefix: '/api/v1'
        }
    },
    {
        register: require('./lib/plugins/roles/index.js'),
        routes: {
            prefix: '/api/v1'
        }
    },
    {
        register: require('./lib/plugins/permissions/index.js'),
        routes: {
            prefix: '/api/v1'
        }
    },
    inert,
    vision
]

if (config.swagger.enabled) {
    // Only show the swagger docs (at `/documentation` in development)
    plugins.push({
        register: hapiSwagger,
        options: {
            info: {
                title: 'Hyper API Documentation',
                version: pkgJson.version
            }
        }
    })
}

server.register(plugins, () => {
    // Actually start the server (start listening for incoming requests)
    server.start((err) => {
        if (err) {
            throw err;
        }
        log.info(`Server running at: ${server.info.uri}`);
    })
})