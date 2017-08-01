'use strict'

const Boom = require('boom');
const joi = require('joi');

const config = require('config');
const log = require('util/logger');

const handlers = {};

/**
 * Get permissions list handler
 * GET /permissions
 */
handlers.list = {
    validate: {
        query: {
            order_by: joi.array().items(joi.string().valid('slug')).single(),
            dir: joi.array().items(joi.string().valid('asc', 'desc')).single(),
            filter: joi.string(),
            f_field: joi.array().items(joi.string().valid('slug')).single(),
            p_size: joi.number().min(1).max(500),
            page: joi.number().min(1)
        }
    },
    handler: (request, reply) => {

        let filters = request.query || {};

        if (filters.order_by) filters.order_by = filters.order_by[0];
        if (filters.dir) filters.dir = filters.dir[0];
        if (filters.f_field) filters.f_field = filters.f_field[0];

        request.server.methods.services.act({
                role: 'permission',
                cmd: 'list'
            }, { params: filters },
            (err, response) => {

                if (err) {
                    log.error(err, 'Failed to retrieve permissions list [Seneca error]');
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
    id: 'hyper-permissions-list',
    tags: ['permissions']
};

/**
 * Get permissions list handler
 * GET /permissions
 */
handlers.get = {
    validate: {
        params: {
            permissionid: joi.number().required()
        },
    },
    handler: (request, reply) => {

        let permission = {
            id: request.params.permissionid
        };

        request.server.methods.services.act({
                role: 'permission',
                cmd: 'get'
            }, {
                data: {
                    id: request.params.permissionid
                }
            },
            (err, response) => {
                if (err) {
                    log.error(err, 'Failed to retrieve permission [Seneca error]');
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
    id: 'hyper-permissions-get',
    tags: ['permissions']
};

/**
 * Create permission handler
 * POST /permissions
 */
handlers.create = {
    validate: {
        options: {
            stripUnknown: {
                objects: true
            }
        },
        payload: joi.object({
            slug: joi.string().required()
        })
    },
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'permission',
                cmd: 'add'
            }, {
                data: request.payload
            },
            (err, response) => {
                if (err) {
                    log.error(err, 'Failed to create permission [Seneca error]');
                    return reply(Boom.internal('Internal timeout'));
                }

                if (response && response.err) {
                    return reply(Boom.badRequest('Failed to create permission'));
                } else if (response && response.payload) {
                    return reply(response.payload).created();
                }

                reply(Boom.internal('Something went wrong while creating permission'));
            });
    },
    id: 'hyper-permission-create',
    tags: ['permissions']
};

/**
 * Update permission handler
 * PUT /permissions/{id}
 */
handlers.update = {
    validate: {
        options: {
            stripUnknown: true
        },
        params: {
            permissionid: joi.number().required()
        },
        payload: joi.object({
            slug: joi.string().required()
        })
    },
    handler: (request, reply) => {

        let accountID = request.params.accountid;
        let accountPayload = request.payload;
        accountPayload.id = accountID;

        request.server.methods.services.act({
                role: 'permission',
                cmd: 'update'
            }, {
                data: accountPayload
            },
            (err, response) => {

                if (err) {
                    log.error(err, 'Failed to update permission [Seneca error]');
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
    id: 'hyper-permissions-edit',
    tags: ['permissions']
};

/**
 * Delete permission handler
 * DELETE /permissions/{id}
 */
handlers.remove = {
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'permission',
                cmd: 'delete'
            }, {
                id: request.params.permissionid
            },
            (err, response) => {

                if (err) {
                    log.error(err, 'Failed to remove permission [Seneca error]');
                    return reply(Boom.internal('Internal timeout'));
                }

                if (response && response.err) {
                    return reply(Boom.internal(err));
                }

                reply();
            });
    },
    id: 'hyper-permissions-delete',
    tags: ['permissions']
};

module.exports = handlers;