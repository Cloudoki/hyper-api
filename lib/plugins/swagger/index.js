'use strict'

const hapiSwagger = require('hapi-swagger');

module.exports = {
    register: hapiSwagger,
    options: {
        info: {
            title: 'Hyper API Documentation',
            version: '0.0.1'
        }
    }
};