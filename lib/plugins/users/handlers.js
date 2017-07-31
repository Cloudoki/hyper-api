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
    handler: (request, reply) => {

        let filters = request.query || {};

        if (filters.order_by) filters.order_by = filters.order_by[0];
        if (filters.dir) filters.dir = filters.dir[0];
        if (filters.f_field) filters.f_field = filters.f_field[0];

        request.server.methods.services.act({
                role: 'user',
                cmd: 'list'
            }, { params: filters },
            (err, response) => {

                if (err) {
                    log.error(err, 'Failed to retrieve users list [Seneca error]');
                    return reply(Boom.internal('Internal timeout'));
                }

                if (response && response.err) {
                    return reply(Boom.internal(response.err));
                }

                if (response && response.payload) {
                    return reply(response.payload);
                }

                reply(Boom.notFound());
            });
    },
    id: 'hyper-users-list',
    tags: ['users']
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
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'user',
                cmd: 'get'
            }, {
                params: {
                    id: request.params.userid
                }
            },
            (err, response) => {
                if (err) {
                    log.error(err, 'Failed to retrieve user [Seneca error]');
                    return reply(Boom.internal('Internal timeout'));
                }

                if (response && response.err) {
                    return reply(Boom.internal(err));
                }

                if (response && response.payload) {
                    return reply(response.payload);
                }

                reply(Boom.notFound());
            });
    },
    id: 'hyper-users-get',
    tags: ['users']
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
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'user',
                cmd: 'add'
            }, {
                data: request.payload
            },
            (err, response) => {
                if (err) {
                    log.error(err, 'Failed to add user [Seneca error]');
                    return reply(Boom.internal('Internal timeout'));
                }

                if (response && response.err) {
                    return reply(Boom.badRequest('Failed to create user'));
                } else if (response && response.payload) {
                    return reply(response.payload).created();
                }

                reply(Boom.internalt('Something went wrong while creating user'));
            });
    },
    id: 'hyper-users-add',
    tags: ['users']
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
    handler: (request, reply) => {

        let userID = request.params.userid;
        let userPayload = request.payload;
        userPayload.id = userID;

        request.server.methods.services.act({
                role: 'user',
                cmd: 'update'
            }, {
                data: userPayload
            },
            (err, response) => {

                if (err) {
                    log.error(err, 'Failed to update user [Seneca error]');
                    return reply(Boom.internal('Internal timeout'));
                }

                if (response && response.err) {
                    return reply(Boom.badRequest('Failed to update user'));
                }

                if (response && response.payload) {
                    return reply(response.payload);
                }

                reply(Boom.notFound());
            });
    },
    id: 'hyper-users-edit',
    tags: ['users']
};

/**
 * Delete user handler
 * DELETE /users/{id}
 */
handlers.delete = {
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'user',
                cmd: 'delete'
            }, {
                id: request.params.userid
            },
            (err, response) => {

                if (err) {
                    log.error(err, 'Failed to remove user [Seneca error]');
                    return reply(Boom.internal('Internal timeout'));
                }

                if (response && response.err) {
                    return reply(Boom.internal(err));
                }

                reply();
            });
    },
    id: 'hyper-users-delete',
    tags: ['users']
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
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'user',
                cmd: 'account-add'
            }, {
                data: {
                    id: request.params.userid,
                    account: {
                        id: request.payload.id
                    }
                }
            },
            (err, response) => {

                if (err) {
                    log.error(err, 'Failed to add account to user [Seneca error]');
                    return reply(Boom.internal('Internal timeout'));
                }

                if (response && response.err) {
                    return reply(Boom.internal(err));
                }

                reply();
            });
    },
    id: 'hyper-users-account-add',
    tags: ['users']
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
                data: {
                    id: request.params.userid,
                    account: {
                        id: request.params.accountid
                    }
                }
            },
            (err, response) => {

                if (err) {
                    log.error(err, 'Failed to remove user account [Seneca error]');
                    return reply(Boom.internal('Internal timeout'));
                }

                if (response && response.err) {
                    return reply(Boom.internal(err));
                }

                reply();
            });
    },
    id: 'hyper-users-account-remove',
    tags: ['users']
};

module.exports = handlers;