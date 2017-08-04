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
    auth: {
        strategy: 'hyperToken',
        scope: ['permission_read']
    },
    handler: (request, reply) => {

        let filters = request.query || {};

        if (filters.order_by) filters.order_by = filters.order_by[0];
        if (filters.dir) filters.dir = filters.dir[0];
        if (filters.f_field) filters.f_field = filters.f_field[0];

        request.server.methods.services.act({
                role: 'permission',
                cmd: 'list'
            }, filters,
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-permissions-list',
    tags: ['api']
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
    auth: {
        strategy: 'hyperToken',
        scope: ['permission_read']
    },
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'permission',
                cmd: 'get'
            }, {
                id: request.params.permissionid
            },
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-permissions-get',
    tags: ['api']
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
    auth: {
        strategy: 'hyperToken',
        scope: ['permission_create']
    },
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'permission',
                cmd: 'add'
            }, {
                data: request.payload
            },
            (err, data) => {
                if (err) return reply(err);
                reply(data).created();
            });
    },
    id: 'hyper-permission-create',
    tags: ['api']
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
    auth: {
        strategy: 'hyperToken',
        scope: ['permission_update']
    },
    handler: (request, reply) => {

        let accountID = request.params.accountid;
        let accountPayload = request.payload;
        accountPayload.id = accountID;

        request.server.methods.services.act({
                role: 'permission',
                cmd: 'update'
            }, accountPayload,
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-permissions-edit',
    tags: ['api']
};

/**
 * Delete permission handler
 * DELETE /permissions/{id}
 */
handlers.remove = {
    auth: {
        strategy: 'hyperToken',
        scope: ['permission_delete']
    },
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'permission',
                cmd: 'delete'
            }, {
                id: request.params.permissionid
            },
            (err, data) => {
                if (err) return reply(err);
                reply();
            });
    },
    id: 'hyper-permissions-delete',
    tags: ['api', 'permissions']
};

module.exports = handlers;