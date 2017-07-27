'use strict'

const senecaClient = require('./senecaClient');

exports.register = function(server, options, next) {

    server.method('services.act', senecaClient.act);

    senecaClient.connect(next);
}

exports.register.attributes = {
    name: 'Services consumer'
};