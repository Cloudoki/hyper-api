'use strict'

const logger = require('util/logger');

module.exports = {
    register: require('good'),
    options: {
        ops: {
            interval: 30000
        },
        reporters: {
            bunyan: [{
                module: 'good-bunyan',
                args: [
                    { ops: '*', response: '*', log: '*', error: '*', request: '*' },
                    {
                        logger: logger,
                        levels: {
                            ops: 'debug',
                            response: 'debug'
                        },
                        formatters: {
                            response: (data) => {
                                //return data;
                                return '[response] ' + data.statusCode + ' ' + data.method.toUpperCase() + ' ' + data.path;
                            }
                        }
                    }
                ]
            }]
        }
    }
};