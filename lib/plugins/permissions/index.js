'use strict'

const handlers = require('./handlers');
const pre = require('./pre');

exports.register = function(server, options, next) {

    server.method('permissions.hasPermission', pre.hasPermission);

    server.route([{
            method: 'GET',
            path: '/permissions',
            config: handlers.list
        },
        {
            method: 'GET',
            path: '/permissions/{permissionid}',
            config: handlers.get
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'hyper-user-permissions'
};