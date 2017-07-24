'use strict'

const handlers = require('./handlers');

exports.register = function (server, options, next) {
    server.route([{
            method: 'GET',
            path: '/accounts',
            config: handlers.list
        },
        {
            method: 'POST',
            path: '/accounts',
            config: handlers.add
        },
        {
            method: 'GET',
            path: '/accounts/{accountid}',
            config: handlers.get
        },
        {
            method: 'PUT',
            path: '/accounts/{accountid}',
            config: handlers.edit
        },
        {
            method: 'DELETE',
            path: '/accounts/{accountid}',
            config: handlers.delete
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'hyper-user-accounts'
};