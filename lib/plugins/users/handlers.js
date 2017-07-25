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
        
        mq.sendSync('hyper.user.list', meta).then((msg) => {

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
    id: 'hyper-users-list',
    tags: ['api']
};

exports.get = {
    validate: {
        params: {
               userid : joi.number().required()
           },
    },
    handler: (request, reply) => {

        let user = {
            id: request.params.userid
        };

        mq.sendSync('hyper.user.get', user).then((msg) => {

            if (msg.status === 500) {
                reply(boom.internal(msg.error));
                return
            }

            if (!msg.payload) {
                reply(boom.notFound());
                return
            }

            reply(msg.payload);

        }).catch((err) => {
            log.error(err);
            reply(boom.internal(err));
        });


    },
    id: 'hyper-users-get',
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

        mq.sendSync('hyper.user.add', userPayload).then((msg) => {

            if (msg.status === 500) {
                reply(boom.internal(msg.error));
                return
            }

            if (msg.status === 409) {
                reply(boom.conflict('A user with this email is already registered'));
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
    id: 'hyper-users-add',
    tags: ['api']
};

exports.edit = {
    validate: {
        options: {
            stripUnknown: true
        },
        params: {
            userid : joi.number().required()
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

        mq.sendSync('hyper.user.update', userPayload).then((msg) => {

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
    id: 'hyper-users-edit',
    tags: ['api']
};

exports.delete = {
    handler: (request, reply) => {

        let userPayload = {
            id: request.params.userid
        };

        mq.sendSync('hyper.user.delete', userPayload).then((msg) => {

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
    id: 'hyper-users-delete',
    tags: ['api']
};

exports.addAccount = {
    validate: {
        options: {
            stripUnknown: true
        },
        params: {
            userid : joi.number().required()
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

        mq.sendSync('hyper.user.account.add', userPayload).then((msg) => {

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
    id: 'hyper-users-account-add',
    tags: ['api']
};

exports.removeAccount = {
    validate: {
        options: {
            stripUnknown: true
        },
        params: {
            userid : joi.number().required(),
            accountid : joi.number().required()
        }
    },
    handler: (request, reply) => {

        let userPayload = {
            id: request.params.userid,
            account: {
                id: request.params.accountid
            }
        };

        mq.sendSync('hyper.user.account.remove', userPayload).then((msg) => {

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
    id: 'hyper-users-account-remove',
    tags: ['api']
};

exports.superAdmin = {
    validate: {
        options: {
            stripUnknown: true
        },
        params: {
            userid : joi.number().required()
        },
        payload: joi.object({
            superAdmin: joi.boolean().required()
        })
    },
    handler: (request, reply) => {

        let userID = request.params.userid;

        let userPayload = request.payload;

        userPayload.id = userID;

        mq.sendSync('hyper.user.update', userPayload).then((msg) => {

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
    id: 'hyper-users-superadmin',
    tags: ['api']
};