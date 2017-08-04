'use strict'

const Boom = require('boom');
const joi = require('joi');
const uuid = require('uuid');

const config = require('config');
const log = require('util/logger');

const handlers = {};

/**
 * Get authorization page handler
 * GET /oauth2/authorize
 */
handlers.getAuthorizationView = {
    auth: 'session',
    handler: function(request, reply) {
        reply.view('authorization', {
            title: 'Authorization page'
        });
    }
};

/**
 * Authorize user handler
 * POST /oauth2/authorize
 */
handlers.authorizeUser = {
    auth: 'session',
    validate: {
        query: {
            client_id: joi.string(),
            redirect_uri: joi.string(),
            response_type: joi.string(),
            scope: joi.array().optional()
        }
    },
    handler: function(request, reply) {
        request.server.methods.services.act({
                role: 'oauthClient',
                cmd: 'authorize'
            }, {},
            (err, data) => {
                if (err) return reply(err);
                reply.redirect(data.callback_uri);
            });
    },
    id: 'hyper-oauth-authorize-user',
    tags: ['api']
};

/**
 * Get home page handler
 * GET /home
 */
handlers.getHomeView = {
    handler: function(request, reply) {
        reply.view('home', {
            title: 'Home page'
        });
    }
};

/**
 * Get authorization page handler
 * GET /oauth2/authenticate
 */
handlers.getAuthenticationView = {
    validate: {
        query: {
            next: joi.string()
        }
    },
    handler: function(request, reply) {
        reply.view('authentication', {
            title: 'Login page',
            nextUrl: false || request.query.next
        });
    }
};

/**
 * Authenticate user handler
 * POST /oauth2/authenticate
 */
handlers.authenticateUser = {
    validate: {
        payload: {
            username: joi.string().required(),
            password: joi.string().required(),
            next: joi.string().allow('')
        }
    },
    handler: function(request, reply) {
        console.log(request.payload);
        let sid = uuid.v1();
        request.server.app.cache.set(sid, { account: 'Mike' }, 0, (err) => {
            if (err) {
                log.warn(err, 'Failed to authenticate user on /login');
                return reply(err);
            }

            request.cookieAuth.set({ sid: sid });
            let nextPage = (request.payload.next) ? request.payload.next : '/oauth2/home';
            return reply.redirect(nextPage);
        });
    },
    id: 'hyper-authenticate-user',
    tags: ['api']
};

/**
 * Logout user handler
 * POST /oauth2/logout
 */
handlers.logoutUser = {
    handler: function(request, reply) {
        request.cookieAuth.clear();
        return reply.redirect('/oauth2/authenticate');
    }
};

/**
 * Get Access token handler
 * POST /oauth2/token
 */
handlers.getAccessToken = {
    validate: {
        payload: {
            client_id: joi.string(),
            redirect_uri: joi.string(),
            response_type: joi.string(),
            scope: joi.array().optional()
        }
    },
    handler: function(request, reply) {
        request.server.methods.services.act({
                role: 'oauthClient',
                cmd: 'authorize'
            }, {},
            (err, data) => {
                if (err) return reply(err);
                reply.redirect(data.callback_uri);
            });
    },
    id: 'hyper-oauth-get-access-token',
    tags: ['api']
};

/**
 * RevoveAccess token handler
 * POST /oauth2/revoke
 */
handlers.revokeAccessToken = {
    auth: {
        strategy: 'hyperToken'
    },
    validate: {
        payload: {
            client_id: joi.string(),
            redirect_uri: joi.string(),
            response_type: joi.string(),
            scope: joi.array().optional()
        }
    },
    handler: function(request, reply) {
        request.server.methods.services.act({
                role: 'oauthClient',
                cmd: 'authorize'
            }, {},
            (err, data) => {
                if (err) return reply(err);
                reply.redirect(data.callback_uri);
            });
    },
    id: 'hyper-oauth-access-token-revoke',
    tags: ['api']
};


/**
 * Get oauth2 clients list handler
 * GET /oauth2/clients
 */
handlers.listClients = {
    auth: {
        strategy: 'hyperToken',
        scope: ['client_read']
    },
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
    auth: {
        strategy: 'hyperToken',
        scope: ['client_read']
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
    auth: {
        strategy: 'hyperToken',
        scope: ['client_create']
    },
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
    auth: {
        strategy: 'hyperToken',
        scope: ['client_update']
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
    auth: {
        strategy: 'hyperToken',
        scope: ['client_delete']
    },
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