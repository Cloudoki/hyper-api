'use strict'

const Boom = require('boom');
const joi = require('joi');

const config = require('config');
const log = require('util/logger');

const handlers = {};

/**
 * Get roles list handler
 * GET /roles
 */
handlers.list = {
    validate: {
        query: {
            order_by: joi.array().items(joi.string().valid('slug', 'description')).single(),
            dir: joi.array().items(joi.string().valid('asc', 'desc')).single(),
            filter: joi.string(),
            f_field: joi.array().items(joi.string().valid('slug', 'description')).single(),
            p_size: joi.number().min(1).max(500),
            page: joi.number().min(1),
            permissions: joi.boolean()
        }
    },
    handler: (request, reply) => {

        let filters = request.query || {};

        if (filters.order_by) filters.order_by = filters.order_by[0];
        if (filters.dir) filters.dir = filters.dir[0];
        if (filters.f_field) filters.f_field = filters.f_field[0];

        request.server.methods.services.act({
                role: 'role',
                cmd: 'list'
            },
            filters,
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-roles-list',
    tags: ['api']
};

/**
 * Get role handler
 * GET /roles/{id}
 */
handlers.get = {
    validate: {
        params: {
            roleid: joi.number().required()
        }
    },
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'role',
                cmd: 'get'
            }, { id: request.params.roleid },
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-roles-get',
    tags: ['api']
};

/**
 * Create role handler
 * POST /roles/{id}
 */
handlers.add = {
    validate: {
        options: {
            stripUnknown: {
                objects: true
            }
        },
        payload: joi.object({
            slug: joi.string().required(),
            description: joi.string().required(),
            permissions: joi.array().items(joi.object({
                id: joi.number().required()
            }))
        })
    },
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'role',
                cmd: 'add'
            }, request.payload,
            (err, data) => {
                if (err) return reply(err);
                reply(data).created();
            });
    },
    id: 'hyper-roles-add',
    tags: ['api']
};

/**
 * Update role handler
 * PUT /roles/{id}
 */
handlers.update = {
    validate: {
        options: {
            stripUnknown: true
        },
        params: {
            roleid: joi.number().required()
        },
        payload: joi.object({
            slug: joi.string().required(),
            description: joi.string().required(),
            permissions: joi.object({
                id: joi.number().required()
            })
        })
    },
    handler: (request, reply) => {

        let roleID = request.params.roleid;
        let rolePayload = request.payload;
        rolePayload.id = roleID;

        request.server.methods.services.act({
                role: 'role',
                cmd: 'update'
            },
            rolePayload,
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-roles-edit',
    tags: ['api']
};

/**
 * Delete role handler
 * DELETE /roles/{id}
 */
handlers.delete = {
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'user',
                cmd: 'delete'
            }, {
                id: request.params.roleid
            },
            (err, data) => {
                if (err) return reply(err);
                reply();
            });
    },
    id: 'hyper-roles-delete',
    tags: ['api']
};

/**
 * Add permission to role handler
 * POST /roles/{roleid}/permissions
 */
handlers.addPermission = {
    validate: {
        options: {
            stripUnknown: true
        },
        params: {
            roleid: joi.number().required()
        },
        payload: joi.object({
            id: joi.number().required()
        })
    },
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'role',
                cmd: 'permission-add'
            }, {
                id: request.params.roleid,
                permission: {
                    id: request.payload.id
                }
            },
            (err, data) => {
                if (err) return reply(err);
                reply();
            });
    },
    id: 'hyper-roles-permission-add',
    tags: ['api']
};

/**
 * Remove permission from role handler
 * DELETE /roles/{roleid}/permissions/{permissionid}
 */
handlers.removePermission = {
    validate: {
        options: {
            stripUnknown: true
        },
        params: {
            roleid: joi.number().required(),
            permissionid: joi.number().required()
        }
    },
    handler: (request, reply) => {

        request.server.methods.services.act({
                role: 'role',
                cmd: 'permission-remove'
            }, {
                id: request.params.roleid,
                permission: {
                    id: request.params.permissionid
                }
            },
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });

    },
    id: 'hyper-roles-permission-remove',
    tags: ['api']
};

module.exports = handlers;