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

        mq.sendSync('hyper.permission.list', meta).then((msg) => {

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
    id: 'hyper-permissions-list',
    tags: ['api']
};

exports.get = {
    validate: {
        params: {
            permissionid: joi.number().required()
        },
    },
    handler: (request, reply) => {

        let permission = {
            id: request.params.permissionid
        };

        mq.sendSync('hyper.permission.get', permission).then((msg) => {

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
    id: 'hyper-permissions-get',
    tags: ['api']
};