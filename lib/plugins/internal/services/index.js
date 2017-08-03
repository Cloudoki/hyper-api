'use strict'

const senecaClient = require('lib/services/senecaClient');

exports.register = function(server, options, next) {

    server.method('services.act', senecaClient.act);

    next();
};

exports.register.attributes = {
    name: 'Services consumer'
};