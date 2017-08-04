'use strict'

const jade = require('jade');
const handlers = require('./handlers');

exports.register = function(server, options, next) {

    server.route([{
            method: 'GET',
            path: '/oauth2/authorize',
            config: handlers.getAuthorizationView
        },
        {
            method: 'POST',
            path: '/oauth2/authorize',
            config: handlers.authorizeUser
        },
        {
            method: 'POST',
            path: '/oauth2/token',
            config: handlers.getAccessToken
        },
        {
            method: 'POST',
            path: '/oauth2/revoke',
            config: handlers.revokeAccessToken
        },
        {
            method: 'GET',
            path: '/oauth2/authenticate',
            config: handlers.getAuthenticationView
        },
        {
            method: 'POST',
            path: '/oauth2/authenticate',
            config: handlers.authenticateUser
        },
        {
            method: 'POST',
            path: '/oauth2/logout',
            config: handlers.logoutUser
        },
        /**{
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
        },*/
        {
            method: 'GET',
            path: '/oauth2/home',
            config: handlers.getHomeView
        },
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

    server.views({
        engines: { jade: jade },
        path: __dirname + '/views',
        compileOptions: {
            pretty: true
        }
    });

    next();
}

exports.register.attributes = {
    name: 'hyper-oauth2'
};