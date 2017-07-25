'use strict'

const handlers = require('./handlers');

exports.register = function (server, options, next) {
    server.route([{
            method: 'GET',
            path: '/users',
            config: handlers.list
        },
        {
            method: 'POST',
            path: '/users',
            config: handlers.add
        },
        {
            method: 'GET',
            path: '/users/{userid}',
            config: handlers.get
        },
        {
            method: 'PUT',
            path: '/users/{userid}',
            config: handlers.edit
        },
        {
            method: 'DELETE',
            path: '/users/{userid}',
            config: handlers.delete
        },
        {
            method: 'POST',
            path: '/users/{userid}/accounts',
            config: handlers.addAccount
        },
        {
            method: 'DELETE',
            path: '/users/{userid}/accounts/{accountid}',
            config: handlers.removeAccount
        },
        {
            method: 'PUT',
            path: '/users/{userid}/superadmin',
            config: handlers.superAdmin
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'hyper-users'
};