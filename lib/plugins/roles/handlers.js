'use strict'

const boom = require('boom');
const joi = require('joi');
const mq = require('hyper-queue');

const config = require('config');
const log = require('util/logger');

exports = module.exports = {};

exports.list = {
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

        let meta = {
            meta: request.query
        };

        if (meta.order_by) {
            meta.order_by = meta.order_by[0];
        }

        if (meta.dir) {
            meta.dir = meta.dir[0];
        }

        if (meta.f_field) {
            meta.f_field = meta.f_field[0];
        }

        mq.sendSync('hyper.role.list', meta).then((msg) => {

            if (msg.status === 500) {
                reply(boom.internal(msg.error));
                return
            }

            reply(msg.payload);

        }).catch((err) => {
            log.error(err);
            reply(boom.internal(err));
        });

    },
    id: 'hyper-roles-list',
    tags: ['api']
};

exports.get = {
    validate: {
        params: {
            roleid: joi.number().required()
        }
    },
    handler: (request, reply) => {

        let role = {
            id: request.params.roleid
        };

        mq.sendSync('hyper.role.get', role).then((msg) => {

            if (msg.status === 500) {
                reply(boom.internal(msg.error));
                return
            }

            if (msg.status === 404) {
                reply(boom.notFound());
                return
            }

            reply(msg.payload);

        }).catch((err) => {
            log.error(err);
            reply(boom.internal(err));
        });


    },
    id: 'hyper-roles-get',
    tags: ['api']
};

exports.add = {
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

        let rolePayload = request.payload;

        mq.sendSync('hyper.role.add', rolePayload).then((msg) => {

            if (msg.status === 500) {
                reply(boom.internal(msg.error));
                return
            }

            if (msg.status === 409) {
                reply(boom.conflict('A role with this name is already registered'));
                return
            }

            if (msg.status === 400) {
                reply(boom.badRequest(msg.payload));
                return
            }

            reply(msg.payload);

        }).catch((err) => {
            log.error(err);
            reply(boom.internal(err));
        });

    },
    id: 'hyper-roles-add',
    tags: ['api']
};

exports.edit = {
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

        mq.sendSync('hyper.role.update', rolePayload).then((msg) => {

            if (msg.status === 500) {
                reply(boom.internal(msg.error));
                return
            }

            if (msg.status === 409) {
                reply(boom.conflict('A role with this name is already registered'));
                return
            }

            if (msg.status === 404) {
                reply(boom.notFound());
                return
            }

            reply(msg.payload);

        }).catch((err) => {
            log.error(err);
            reply(boom.internal(err));
        });

    },
    id: 'hyper-roles-edit',
    tags: ['api']
};

exports.delete = {
    handler: (request, reply) => {

        let rolePayload = {
            id: request.params.roleid
        };

        mq.sendSync('hyper.role.delete', rolePayload).then((msg) => {

            if (msg.status === 500) {
                reply(boom.internal(msg.error));
                return
            }

            if (msg.status === 404) {
                reply(boom.notFound());
                return
            }

            reply();

        }).catch((err) => {
            log.error(err);
            reply(boom.internal(err));
        });

    },
    id: 'hyper-roles-delete',
    tags: ['api']
};

exports.addPermission = {
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

        let rolePayload = {
            id: request.params.roleid,
            permission: {
                id: request.payload.id
            }
        };

        mq.sendSync('hyper.role.permission.add', rolePayload).then((msg) => {

            if (msg.status === 500) {
                reply(boom.internal(msg.error));
                return
            }

            if (msg.status === 404) {
                reply(boom.notFound());
                return
            }

            if (msg.status === 400) {
                reply(boom.badRequest(msg.payload));
                return
            }

            reply(msg.payload);

        }).catch((err) => {
            log.error(err);
            reply(boom.internal(err));
        });

    },
    id: 'hyper-roles-permission-add',
    tags: ['api']
};

exports.removePermission = {
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

        let rolePayload = {
            id: request.params.roleid,
            permission: {
                id: request.params.permissionid
            }
        };

        mq.sendSync('hyper.role.permission.remove', rolePayload).then((msg) => {

            if (msg.status === 500) {
                reply(boom.internal(msg.error));
                return
            }

            if (msg.status === 404) {
                reply(boom.notFound());
                return
            }

            reply(msg.payload);

        }).catch((err) => {
            log.error(err);
            reply(boom.internal(err));
        });

    },
    id: 'hyper-roles-permission-remove',
    tags: ['api']
};