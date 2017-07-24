'use strict'

const handlers = require('./handlers');

exports.register = function (server, options, next) {
    server.route([{
            method: 'GET',
            path: '/permissions',
            config: handlers.list
        },
        {
            method: 'POST',
            path: '/permissions',
            config: handlers.add
        },
        {
            method: 'GET',
            path: '/permissions/{permissionid}',
            config: handlers.get
        },
        {
            method: 'PUT',
            path: '/permissions/{permissionid}',
            config: handlers.edit
        },
        {
            method: 'DELETE',
            path: '/permissions/{permissionid}',
            config: handlers.delete
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'hyper-user-permissions'
};