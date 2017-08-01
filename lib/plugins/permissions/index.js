'use strict'

const handlers = require('./handlers');

exports.register = function(server, options, next) {

    server.route([{
            method: 'GET',
            path: '/permissions',
            config: handlers.list
        },
        {
            method: 'GET',
            path: '/permissions/{permissionid}',
            config: handlers.get
        },
        {
            method: 'POST',
            path: '/permissions',
            config: handlers.create
        },
        {
            method: 'PUT',
            path: '/permissions/{permissionid}',
            config: handlers.update
        },
        {
            method: 'DELETE',
            path: '/permissions/{permissionid}',
            config: handlers.remove
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'hyper-user-permissions'
};