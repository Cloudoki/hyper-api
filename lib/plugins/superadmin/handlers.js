'use strict'

const Boom = require('boom');
const joi = require('joi');

const config = require('config');
const log = require('util/logger');

const handlers = {};

/**
 * Get superadmins list handler
 * GET /superadmins
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
        scope: ['superadmin']
    },
    handler: (request, reply) => {
        let filters = request.query || {};

        if (filters.order_by) filters.order_by = filters.order_by[0];
        if (filters.dir) filters.dir = filters.dir[0];
        if (filters.f_field) filters.f_field = filters.f_field[0];

        request.server.methods.services.act({
                role: 'superadmin',
                cmd: 'list'
            }, filters,
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-superadmins-list',
    tags: ['api']
};

/**
 * Get superadmin handler
 * GET /superadmins/{id}
 */
handlers.get = {
    validate: {
        params: {
            userid: joi.number().required()
        },
    },
    auth: {
        strategy: 'hyperToken',
        scope: ['superadmin']
    },
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'superadmin',
                cmd: 'get'
            }, {
                id: request.params.userid
            },
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-superadmins-get',
    tags: ['api']
};

/**
 * Create superadmin handler
 * POST /superadmins
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
    auth: {
        strategy: 'hyperToken',
        scope: ['superadmin']
    },
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'superadmin',
                cmd: 'add'
            },
            request.payload,
            (err, data) => {
                if (err) return reply(err);
                reply(data).created();
            });
    },
    id: 'hyper-superadmins-add',
    tags: ['api']
};

/**
 * Update superadmin handler
 * PUT /superadmins/{id}
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
    auth: {
        strategy: 'hyperToken',
        scope: ['superadmin']
    },
    handler: (request, reply) => {

        let userID = request.params.userid;
        let userPayload = request.payload;
        userPayload.id = userID;

        request.server.methods.services.act({
                role: 'superadmin',
                cmd: 'update'
            }, userPayload,
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-superadmins-edit',
    tags: ['api']
};

/**
 * Delete superadmin handler
 * DELETE /superadmins/{id}
 */
handlers.delete = {
    auth: {
        strategy: 'hyperToken',
        scope: ['superadmin']
    },
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'superadmin',
                cmd: 'delete'
            }, {
                id: request.params.userid
            },
            (err, data) => {
                if (err) return reply(err);
                reply();
            });
    },
    id: 'hyper-superadmins-delete',
    tags: ['api']
};

module.exports = handlers;