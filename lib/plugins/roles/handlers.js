'use strict'

const boom = require('boom');
const joi = require('joi');
const mq = require('hyper-queue');

const config = require('config');
const log = require('log');

exports = module.exports = {};

exports.list = {
    validate: {
        query: {
            order_by: joi.array().items(joi.string().valid('slug', 'description')).single(),
            dir: joi.array().items(joi.string().valid('asc', 'desc')).single(),
            filter: joi.string(),
            f_field: joi.array().items(joi.string().valid('slug', 'description')).single(),
            p_size: joi.number().min(1).max(500),
            page: joi.number().min(1)
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
            reply(msg);
        }).catch((err) => {
            log.error(err);
            reply(err);
        });

    },
    id: 'hyper-roles-list',
    tags: ['api']
};

exports.get = {
    handler: (request, reply) => {

        let role = {
            id: request.params.roleid
        };

        mq.sendSync('hyper.role.get', role).then((msg) => {
            reply(msg);
        }).catch((err) => {
            log.error(err);
            reply(err);
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
            reply(msg);
        }).catch((err) => {
            log.error(err);
            reply(err);
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
        payload: joi.object({
            slug: joi.string().required(),
            description: joi.string().required(),
            permissions: joi.array().items(joi.object({
                id: joi.number().required()
            }))
        })
    },
    handler: (request, reply) => {

        let roleID = request.params.roleid;

        let rolePayload = request.payload;

        rolePayload.id = roleID;

        mq.sendSync('hyper.role.update', rolePayload).then((msg) => {
            reply(msg);
        }).catch((err) => {
            log.error(err);
            reply(err);
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
            reply(msg);
        }).catch((err) => {
            log.error(err);
            reply(err);
        });

    },
    id: 'hyper-roles-delete',
    tags: ['api']
};