'use strict'

const Boom = require('boom');
const joi = require('joi');

const config = require('config');
const log = require('util/logger');

const handlers = {};

/**
 * Get accounts list handler
 * GET /accounts
 */
handlers.list = {
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

        let filters = request.query || {};

        if (filters.order_by) filters.order_by = filters.order_by[0];
        if (filters.dir) filters.dir = filters.dir[0];
        if (filters.f_field) filters.f_field = filters.f_field[0];

        request.server.methods.services.act({
                role: 'account',
                cmd: 'list'
            }, filters,
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-accounts-list',
    tags: ['api']
};

/**
 * Get account handler
 * GET /accounts/{id}
 */
handlers.get = {
    validate: {
        params: {
            accountid: joi.number().required()
        },
    },
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'account',
                cmd: 'get'
            }, {
                id: request.params.accountid
            },
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-accounts-get',
    tags: ['api']
};

/**
 * Create account handler
 * POST /accounts
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
            role: joi.object({
                id: joi.number().required()
            })
        })
    },
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'account',
                cmd: 'add'
            }, request.payload,
            (err, data) => {
                if (err) return reply(err);
                reply(data).created();
            });
    },
    id: 'hyper-accounts-add',
    tags: ['api']
};

/**
 * Update account handler
 * PUT /accounts/{id}
 */
handlers.update = {
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

        request.server.methods.services.act({
                role: 'account',
                cmd: 'update'
            }, accountPayload,
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-accounts-edit',
    tags: ['api']
};

/**
 * Delete account handler
 * DELETE /accounts/{id}
 */
handlers.delete = {
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'account',
                cmd: 'delete'
            }, {
                id: request.params.accountid
            },
            (err, data) => {
                if (err) return reply(err);
                reply();
            });
    },
    id: 'hyper-accounts-delete',
    tags: ['api']
};

module.exports = handlers;