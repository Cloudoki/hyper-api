'use strict'

const handlers = require('./handlers');

exports.register = function(server, options, next) {
    server.route([{
            method: 'GET',
            path: '/superadmins',
            config: handlers.list
        },
        {
            method: 'POST',
            path: '/superadmins',
            config: handlers.add
        },
        {
            method: 'GET',
            path: '/superadmins/{userid}',
            config: handlers.get
        },
        {
            method: 'PUT',
            path: '/superadmins/{userid}',
            config: handlers.update
        },
        {
            method: 'DELETE',
            path: '/superadmins/{userid}',
            config: handlers.delete
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'hyper-superadmin'
};