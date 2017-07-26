'use strict'

const serverMethods = require('./serverMethods');

exports.register = function(server, options, next) {

    server.method('services.query', serverMethods.query);

    next();
}

exports.register.attributes = {
    name: 'hyper-user-roles'
};