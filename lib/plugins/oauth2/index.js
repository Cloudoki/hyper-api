'use strict'

const handlers = require('./handlers');

exports.register = function(server, options, next) {

    server.route([
        /* {
            method: 'GET',
            path: '/oauth2/authorize',
            config: handlers.getAuthorization
        },
        {
            method: 'POST',
            path: '/oauth2/authorize',
            config: handlers.postAuthorization
        },
        {
            method: 'POST',
            path: '/token',
            config: handlers.postAuthorization
        },
        {
            method: 'POST',
            path: '/revoke',
            config: handlers.postAuthorization
        }, */
        {
            method: 'GET',
            path: '/login',
            config: handlers.getLoginPage
        },
        /* {
            method: 'POST',
            path: '/logout',
            config: handlers.postAuthorization
        },
        {
            method: 'GET',
            path: '/recover_password',
            config: handlers.postAuthorization
        },
        {
            method: 'POST',
            path: '/recover_password',
            config: handlers.postAuthorization
        },
        {
            method: 'GET',
            path: '/account/new',
            config: handlers.postAuthorization
        },
        {
            method: 'POST',
            path: '/account',
            config: handlers.postAuthorization
        },*/
        {
            method: 'GET',
            path: '/oauth2/clients',
            config: handlers.listClients
        },
        {
            method: 'POST',
            path: '/oauth2/clients',
            config: handlers.createClient
        },
        {
            method: 'GET',
            path: '/oauth2/clients/{id}',
            config: handlers.getClient
        },
        {
            method: 'DELETE',
            path: '/oauth2/clients/{id}',
            config: handlers.removeClient
        },
        {
            method: 'PUT',
            path: '/oauth2/clients/{id}',
            config: handlers.updateClient
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'hyper-oauth2'
};