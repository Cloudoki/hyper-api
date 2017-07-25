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
            order_by: joi.array().items(joi.string().valid('slug')).single(),
            dir: joi.array().items(joi.string().valid('asc', 'desc')).single(),
            filter: joi.string(),
            f_field: joi.array().items(joi.string().valid('slug')).single(),
            p_size: joi.number().min(1).max(500),
            page: joi.number().min(1),
            role: joi.boolean()
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

        mq.sendSync('hyper.account.list', meta).then((msg) => {

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
    id: 'hyper-accounts-list',
    tags: ['api']
};

exports.get = {
    validate: {
        params: {
            accountid: joi.number().required()
        },
    },
    handler: (request, reply) => {

        let account = {
            id: request.params.accountid
        };

        mq.sendSync('hyper.account.get', account).then((msg) => {

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
    id: 'hyper-accounts-get',
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
            role: joi.object({
                id: joi.number().required()
            })
        })
    },
    handler: (request, reply) => {

        let accountPayload = request.payload;

        mq.sendSync('hyper.account.add', accountPayload).then((msg) => {

            if (msg.status === 500) {
                reply(boom.internal(msg.error));
                return
            }

            if (msg.status === 409) {
                reply(boom.conflict('A account with the same name is already registered'));
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
    id: 'hyper-accounts-add',
    tags: ['api']
};

exports.edit = {
    validate: {
        options: {
            stripUnknown: true
        },
        params: {
            accountid: joi.number().required()
        },
        payload: joi.object({
            slug: joi.string().required(),
            role: joi.object({
                id: joi.number().required()
            })
        })
    },
    handler: (request, reply) => {

        let accountID = request.params.accountid;

        let accountPayload = request.payload;

        accountPayload.id = accountID;

        mq.sendSync('hyper.account.update', accountPayload).then((msg) => {

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
    id: 'hyper-accounts-edit',
    tags: ['api']
};

exports.delete = {
    handler: (request, reply) => {

        let accountPayload = {
            id: request.params.accountid
        };

        mq.sendSync('hyper.account.delete', accountPayload).then((msg) => {

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
    id: 'hyper-accounts-delete',
    tags: ['api']
};