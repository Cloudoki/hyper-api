'use strict'

const Boom = require('boom');
const joi = require('joi');

const config = require('config');
const log = require('util/logger');

const handlers = {};

handlers.getLoginPage = {
    handler: function(request, reply) {
        return reply('<html><head><title>Login page</title></head><body>' +
            '<h3>Hyper Login</h3><br/>' +
            '<form method="post" action="/login">' +
            'Username: <input type="text" name="username"><br>' +
            'Password: <input type="password" name="password"><br/>' +
            '<input type="submit" value="Login"></form></body></html>');
    }
};

let uuid = 1;
const users = {
    john: {
        id: 'john',
        password: 'password',
        name: 'John Doe'
    }
};

handlers.login = {
    auth: 'oauth',
    handler: function loginHandler(request, reply) {
        if (!request.payload.username || !request.payload.password) {
            reply('Missing username or password');
        } else {
            account = users[request.payload.username];
            if (!account || account.password !== request.payload.password) {

                reply('Invalid username or password');
            }
        }

        const sid = String(++uuid);
        request.server.app.cache.set(sid, { account: account }, 0, (err) => {

            if (err) {
                reply(err);
            }

            request.cookieAuth.set({ sid: sid });
            return reply.redirect('/');
        });
    }
};

/**
 * Get oauth2 clients list handler
 * GET /oauth2/clients
 */
handlers.listClients = {
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'oauthClient',
                cmd: 'list'
            }, {},
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-oauth-clients-list',
    tags: ['api']
};

/**
 * Get oauth2 client handler
 * GET /oauth2/clients/{id}
 */
handlers.getClient = {
    validate: {
        params: {
            id: joi.number().required()
        }
    },
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'oauthClient',
                cmd: 'get'
            }, {
                id: request.params.userid
            },
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-oauth2-clients-get',
    tags: ['api']
};

/**
 * Create oauth2 client handler
 * POST /oauth2/clients
 */
handlers.createClient = {
    validate: {},
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'oauthClient',
                cmd: 'add'
            },
            request.payload,
            (err, data) => {
                if (err) return reply(err);
                reply(data).created();
            });
    },
    id: 'hyper-oauth-clients-add',
    tags: ['api']
};

/**
 * Update oauth2 client handler
 * PUT /oauth2/clients/{id}
 */
handlers.updateClient = {
    validate: {
        params: {
            id: joi.number().required()
        }
    },
    handler: (request, reply) => {

        let userID = request.params.id;
        let userPayload = request.payload;
        userPayload.id = userID;

        request.server.methods.services.act({
                role: 'oauthClient',
                cmd: 'update'
            }, userPayload,
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-oauth-clients-edit',
    tags: ['api']
};

/**
 * Delete oauth client handler
 * DELETE /oauth2/clients/{id}
 */
handlers.removeClient = {
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'oauthClient',
                cmd: 'delete'
            }, {
                id: request.params.id
            },
            (err, data) => {
                if (err) return reply(err);
                reply();
            });
    },
    id: 'hyper-oauth-clients-delete',
    tags: ['api']
};

module.exports = handlers;