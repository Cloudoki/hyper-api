'use strict'

const handlers = require('./handlers');

exports.register = function (server, options, next) {
    server.route([{
            method: 'GET',
            path: '/roles',
            config: handlers.list
        },
        {
            method: 'POST',
            path: '/roles',
            config: handlers.add
        },
        {
            method: 'GET',
            path: '/roles/{roleid}',
            config: handlers.get
        },
        {
            method: 'PUT',
            path: '/roles/{roleid}',
            config: handlers.edit
        },
        {
            method: 'DELETE',
            path: '/roles/{roleid}',
            config: handlers.delete
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'hyper-user-roles'
};