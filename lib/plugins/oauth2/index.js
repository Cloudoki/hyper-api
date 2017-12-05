'use strict'

const pug = require('pug');
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
            method: 'GET',
            path: '/oauth2/unauthorize',
            config: handlers.getUnauthorizationView
        },
        {
            method: 'POST',
            path: '/oauth2/unauthorize',
            config: handlers.revokeClient
        },
        {
            method: 'POST',
            path: '/oauth2/token',
            config: handlers.getAccessToken
        },
        {
            method: 'POST',
            path: '/token',
            config: handlers.getToken
        },
        {
            method: 'POST',
            path: '/oauth2/revoke',
            config: handlers.revokeAccessToken
        },
        {
            method: 'GET',
            path: '/oauth2/{account}/authenticate',
            config: handlers.getAuthenticationView
        },
        {
            method: 'POST',
            path: '/oauth2/{account}/authenticate',
            config: handlers.authenticateUser
        },
        {
            method: 'POST',
            path: '/oauth2/logout',
            config: handlers.logoutUser
        },
        {
            method: 'GET',
            path: '/recover',
            config: handlers.getRecoverPasswordView
        },
        {
            method: 'POST',
            path: '/recover',
            config: handlers.recoverPassword
        },
        {
            method: 'POST',
            path: '/recover_password',
            config: handlers.updatePassword
        },
        /**{
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
        engines: { pug: pug },
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
