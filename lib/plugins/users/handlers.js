'use strict'

const Boom = require('boom');
const joi = require('joi');

const config = require('config');
const log = require('util/logger');

const handlers = {};

/**
 * Get users list handler
 * GET /users
 */
handlers.list = {
    validate: {
        query: {
            order_by: joi.array().items(joi.string().valid('email', 'first_name', 'last_name', 'super_admin')).single(),
            dir: joi.array().items(joi.string().valid('asc', 'desc')).single(),
            filter: joi.string(),
            f_field: joi.array().items(joi.string().valid('email', 'first_name', 'last_name')).single(),
            p_size: joi.number().min(1).max(500),
            page: joi.number().min(1),
            role: joi.boolean(),
            accounts: joi.boolean()
        }
    },
    auth: {
        strategy: 'hyperToken',
        scope: ['users:read']
    },
    handler: (request, reply) => {
        let filters = request.query || {};

        if (filters.order_by) filters.order_by = filters.order_by[0];
        if (filters.dir) filters.dir = filters.dir[0];
        if (filters.f_field) filters.f_field = filters.f_field[0];

        request.server.methods.services.act({
                role: 'user',
                cmd: 'list'
            }, filters,
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-users-list',
    tags: ['api']
};

/**
 * Get user handler
 * GET /users/{id}
 */
handlers.get = {
    validate: {
        params: {
            userid: joi.number().required()
        },
    },
    plugins: {
        hyperAcl: { permissions: ['users:read'] }
    },
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'user',
                cmd: 'get'
            }, {
                id: request.params.userid
            },
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-users-get',
    tags: ['api']
};

/**
 * Create user handler
 * POST /users
 */
handlers.add = {
    validate: {
        options: {
            stripUnknown: {
                objects: true
            }
        },
        payload: joi.object({
            firstName: joi.string().required(),
            lastName: joi.string().required(),
            email: joi.string().required(),
            role: joi.object({
                id: joi.number().required()
            }),
            accounts: joi.array().items(joi.object({
                id: joi.number().required()
            }))
        })
    },
    plugins: {
        hyperAcl: { permissions: ['users:create'] }
    },
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'user',
                cmd: 'add'
            },
            request.payload,
            (err, data) => {
                if (err) return reply(err);
                reply(data).created();
            });
    },
    id: 'hyper-users-add',
    tags: ['api']
};

/**
 * Update user handler
 * PUT /users/{id}
 */
handlers.update = {
    validate: {
        options: {
            stripUnknown: true
        },
        params: {
            userid: joi.number().required()
        },
        payload: joi.object({
            firstName: joi.string().required(),
            lastName: joi.string().required(),
            role: joi.object({
                id: joi.number().required()
            })
        })
    },
    plugins: {
        hyperAcl: { permissions: ['users:update'] }
    },
    handler: (request, reply) => {

        let userID = request.params.userid;
        let userPayload = request.payload;
        userPayload.id = userID;

        request.server.methods.services.act({
                role: 'user',
                cmd: 'update'
            }, userPayload,
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-users-edit',
    tags: ['api']
};

/**
 * Delete user handler
 * DELETE /users/{id}
 */
handlers.delete = {
    plugins: {
        hyperAcl: { permissions: ['users:remove'] }
    },
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'user',
                cmd: 'delete'
            }, {
                id: request.params.userid
            },
            (err, data) => {
                if (err) return reply(err);
                reply();
            });
    },
    id: 'hyper-users-delete',
    tags: ['api']
};

/**
 * Add user account handler
 * POST /users/{id}/accounts
 */
handlers.addAccount = {
    validate: {
        options: {
            stripUnknown: true
        },
        params: {
            userid: joi.number().required()
        },
        payload: joi.object({
            id: joi.number().required()
        })
    },
    plugins: {
        hyperAcl: { permissions: ['users_account:create'] }
    },
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'user',
                cmd: 'account-add'
            }, {
                id: request.params.userid,
                account: {
                    id: request.payload.id
                }
            },
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-users-account-add',
    tags: ['api']
};

/**
 * Delete user account
 * DELETE /users/{userid}/accounts/{accountid}
 */
handlers.removeAccount = {
    validate: {
        options: {
            stripUnknown: true
        },
        params: {
            userid: joi.number().required(),
            accountid: joi.number().required()
        }
    },
    plugins: {
        hyperAcl: { permissions: ['users_account:delete'] }
    },
    handler: (request, reply) => {

        let userPayload = {
            id: request.params.userid,
            account: {
                id: request.params.accountid
            }
        };

        request.server.methods.services.act({
                role: 'user',
                cmd: 'account-remove'
            }, {
                id: request.params.userid,
                account: {
                    id: request.params.accountid
                }
            },
            (err, data) => {
                if (err) return reply(err);
                reply();
            });
    },
    id: 'hyper-users-account-remove',
    tags: ['api']
};

module.exports = handlers;