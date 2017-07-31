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
            }, {
                params: filters
            },
            (err, response) => {

                if (err) {
                    log.error(err, 'Failed to retrieve roles list [Seneca error]');
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
    id: 'hyper-roles-list',
    tags: ['roles']
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
            }, {
                params: {
                    id: request.params.roleid
                }
            },
            (err, response) => {
                if (err) {
                    log.error(err, 'Failed to retrieve role [Seneca error]');
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
    id: 'hyper-roles-get',
    tags: ['roles']
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
            }, {
                data: request.payload
            },
            (err, response) => {
                if (err) {
                    log.error(err, 'Failed to create role [Seneca error]');
                    return reply(Boom.internal('Internal timeout'));
                }

                if (response && response.err) {
                    return reply(Boom.badRequest('Failed to create role'));
                } else if (response && response.payload) {
                    return reply(response.payload).created();
                }

                reply(Boom.internal('Something went wrong while creating role'));
            });
    },
    id: 'hyper-roles-add',
    tags: ['roles']
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
            }, {
                data: rolePayload
            },
            (err, response) => {

                if (err) {
                    log.error(err, 'Failed to update role [Seneca error]');
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
    id: 'hyper-roles-edit',
    tags: ['roles']
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
    id: 'hyper-roles-delete',
    tags: ['roles']
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
                data: {
                    id: request.params.roleid,
                    permission: {
                        id: request.payload.id
                    }
                }
            },
            (err, response) => {

                if (err) {
                    log.error(err, 'Failed to add permission to role [Seneca error]');
                    return reply(Boom.internal('Internal timeout'));
                }

                if (response && response.err) {
                    return reply(Boom.internal(err));
                }

                reply();
            });
    },
    id: 'hyper-roles-permission-add',
    tags: ['roles']
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
            (err, response) => {

                if (err) {
                    log.error(err, 'Failed to remove permission from role [Seneca error]');
                    return reply(Boom.internal('Internal timeout'));
                }

                if (response && response.err) {
                    return reply(Boom.internal(err));
                }

                reply();
            });

    },
    id: 'hyper-roles-permission-remove',
    tags: ['roles']
};

module.exports = handlers;