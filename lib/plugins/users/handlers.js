'use strict'

const boom = require('boom');
const joi = require('joi');

const config = require('config');
const log = require('util/logger');

const handlers = {};

// Users List handler
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

        request.server.methods.services.act({
                role: 'user',
                cmd: 'list'
            }),
            meta, (err, response) => {
                if (response.status !== 200) {
                    let error = Boom.boomify(new Error(), { statusCode: response.status });
                    return reply(error);
                }
                reply(response.payload);
            };
    },
    id: 'hyper-users-list',
    tags: ['api']
};

// Users Get handler
handlers.get = {
    validate: {
        params: {
            userid: joi.number().required()
        },
    },
    handler: (request, reply) => {

        let user = {
            id: request.params.userid
        };

        request.server.methods.services.act({
                role: 'user',
                cmd: 'get'
            }),
            user, (err, response) => {
                if (response.status !== 200) {
                    let error = Boom.boomify(new Error(), { statusCode: response.status });
                    return reply(error);
                }
                reply(response.payload);
            };
    },
    id: 'hyper-users-get',
    tags: ['api']
};

// Users Add handler
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
    handler: (request, reply) => {

        let userPayload = request.payload;

        request.server.methods.services.act({
                role: 'user',
                cmd: 'add'
            }),
            userPayload, (err, response) => {
                if (response.status !== 200) {
                    let error = Boom.boomify(new Error(), { statusCode: response.status });
                    return reply(error);
                }
                reply(response.payload);
            };
    },
    id: 'hyper-users-add',
    tags: ['api']
};

// Users Edit handler
handlers.edit = {
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
    handler: (request, reply) => {

        let userID = request.params.userid;
        let userPayload = request.payload;
        userPayload.id = userID;

        request.server.methods.services.act({
                role: 'user',
                cmd: 'update'
            }),
            userPayload, (err, response) => {
                if (response.status !== 200) {
                    let error = Boom.boomify(new Error(), { statusCode: response.status });
                    return reply(error);
                }
                reply(response.payload);
            };
    },
    id: 'hyper-users-edit',
    tags: ['api']
};

handlers.delete = {
    handler: (request, reply) => {

        let userPayload = {
            id: request.params.userid
        };

        request.server.methods.services.act({
                role: 'user',
                cmd: 'delete'
            }),
            userPayload, (err, response) => {
                if (response.status !== 200) {
                    let error = Boom.boomify(new Error(), { statusCode: response.status });
                    return reply(error);
                }
                reply(response.payload);
            };
    },
    id: 'hyper-users-delete',
    tags: ['api']
};

// Users add account handler
handlers.addAccount = {
    validate: {
        options: {
            stripUnknown: true
        },
        params: {
            userid: joi.number().required()
        },
        payload: joi.object({
            id: joi.number().required()
        })
    },
    handler: (request, reply) => {

        let userPayload = {
            id: request.params.userid,
            account: {
                id: request.payload.id
            }
        };

        request.server.methods.services.act({
                role: 'user',
                cmd: 'account-add'
            }),
            user, (err, response) => {
                if (response.status !== 200) {
                    let error = Boom.boomify(new Error(), { statusCode: response.status });
                    return reply(error);
                }
                reply(response.payload);
            };
    },
    id: 'hyper-users-account-add',
    tags: ['api']
};

// Users Account remove handler
handlers.removeAccount = {
    validate: {
        options: {
            stripUnknown: true
        },
        params: {
            userid: joi.number().required(),
            accountid: joi.number().required()
        }
    },
    handler: (request, reply) => {

        let userPayload = {
            id: request.params.userid,
            account: {
                id: request.params.accountid
            }
        };

        request.server.methods.services.act({
                role: 'user',
                cmd: 'account-remove'
            }),
            userPayload, (err, response) => {
                if (response.status !== 200) {
                    let error = Boom.boomify(new Error(), { statusCode: response.status });
                    return reply(error);
                }
                reply(response.payload);
            };
    },
    id: 'hyper-users-account-remove',
    tags: ['api']
};

module.exports = handlers;