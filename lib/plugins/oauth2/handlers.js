'use strict'

const Boom = require('boom');
const joi = require('joi');
const uuid = require('uuid');

const config = require('config');
const log = require('util/logger');
const mailer = require('util/mailer');
const mail_template = require('config/mail_template');

const handlers = {};

/**
 * Get authorization page handler
 * GET /oauth2/authorize
 */
handlers.getAuthorizationView = {
    auth: 'session',
    handler: function(request, reply) {
        reply.view('authorization', {
          title: 'Authorization page',
          path: request.url.path
        });
    }
};

/**
 * Authorize user handler
 * POST /oauth2/authorize
 */
handlers.authorizeUser = {
    auth: 'session',
    validate: {
        query: {
            client_id: joi.string(),
            redirect_uri: joi.string(),
            response_type: joi.string(),
            scope: joi.string().optional()
        }
    },
    handler: function(request, reply) {
        const responseType = request.query.response_type
        if (!['code', 'token'].includes(responseType)) {
          return reply(new hyperError.InvalidResponseType())
        }
        if (responseType == 'code') {
          console.log('code flow')
          request.server.methods.services.act({
              role: 'oauthFlow',
              cmd: 'authorization_code'
          },
          {
            client_id: request.query.client_id,
            user_id: request.auth.credentials.id,
            scope: request.query.scope,
            response_type: responseType
          },
          (err, data) => {
            if (err) return reply(err);
            reply.redirect(`${data.redirect_uri}`);
          });
      	}
        if (responseType == 'token') {
          request.server.methods.services.act({
              role: 'oauthFlow',
              cmd: 'implicit'
          },
          {
            client_id: request.query.client_id,
            user_id: request.auth.credentials.id,
            response_type: responseType
          },
          (err, data) => {
              if (err) return reply(err);
              let sid = uuid.v1()
              request.yar.set(`${sid}`, data);
              reply.redirect(`${data.redirect_uri}?i=${sid}`);
          });
      	}
    },
    id: 'hyper-oauth-authorize-user',
    tags: ['api']
};

/**
 * RevokeClient previously authorized client handler
 * POST /oauth2/unauthorize
 */
/*
handlers.revokeClient = {
    auth: {
        strategy: 'hyperToken'
    },
    validate: {
        payload: {
            client_id: joi.string()
        }
    },
    handler: function(request, reply) {
        request.server.methods.services.act({
                role: 'oauthFlow',
                cmd: 'revokeClient'
            }, {
              client_id: request.query.client_id,
              user_id: request.auth.credentials.id,
            },
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-oauth-unauthorize-user',
    tags: ['api']
};
*/

/**
 * Get home page handler
 * GET /home
 */
handlers.getHomeView = {
    auth: 'session',
    handler: function(request, reply) {
        reply.view('home', {
            title: 'Home page'
        });
    }
};

/**
 * Get authorization page handler
 * GET /oauth2/authenticate
 */
handlers.getAuthenticationView = {
    validate: {
        query: {
            next: joi.string(),
            message: joi.string().allow('')
        }
    },
    handler: function(request, reply) {
        reply.view('authentication', {
            title: 'Login page',
            nextUrl: false || request.query.next,
            message: request.query.message || ''
        });
    }
};

/**
 * Authenticate user handler
 * POST /oauth2/authenticate
 */
handlers.authenticateUser = {
    validate: {
        payload: {
            username: joi.string().required(),
            password: joi.string().required(),
            next: joi.string().allow('')
        }
    },
    handler: function(request, reply) {
        request.server.methods.services.act({
            role: 'oauthFlow',
            cmd: 'login'
        }, {
            username: request.payload.username,
            password: request.payload.password
        }, function(err, data) {
            if (err || !data) {
                log.warn(err, 'Failed to authenticate user on /login');
                return reply.redirect('/oauth2/authenticate');
            }

            let sid = uuid.v1();
            request.server.app.cache.set(sid, { account: data }, 0, (err) => {
                if (err) {
                    log.warn(err, 'Failed to store user session');
                    return reply(err);
                }

                request.cookieAuth.set({ sid: sid });
                let nextPage = (request.payload.next) ? request.payload.next : '/oauth2/home';
                return reply.redirect(nextPage);
            });
        });
    },
    id: 'hyper-authenticate-user',
    tags: ['api']
};

/**
 * Logout user handler
 * POST /oauth2/logout
 */
handlers.logoutUser = {
    handler: function(request, reply) {
        request.cookieAuth.clear();
        return reply.redirect('/oauth2/authenticate');
    }
};

/**
 * Get recover password page handler
 * GET /recover
 */
handlers.getRecoverPasswordView  = {
    handler: function(request, reply) {
      if (request.query.token == null) {
        reply.view('recover_password', {
            title: 'Recover Password'
        });
      } else {
        reply.view('update_password', {
            title: 'Update Password',
            token: request.query.token
        });
      }
    }
};

/**
 * Recover password handler
 * POST /recover
 */
handlers.recoverPassword = {
    validate: {
        payload: {
            email: joi.string().required()
        }
    },
    handler: function(request, reply) {
        request.server.methods.services.act({
            role: 'user',
            cmd: 'generate-recovery-token'
        }, {
            email: request.payload.email
        }, function(err, data) {
            if (err || !data) {
                log.warn(err, 'Failed generate password recovery token.');
                return reply(err);
            }

            const mail_data = {
              username: data.username,
              recoveryURL: `${config.get('publicHost')}recover?token=${data.token}`
            };

            mailer.sendMail({
              from: '"no-reply" <pyui3s3qr7edjuwr@ethereal.email>',
              to: `"${mail_data.username}" <${request.payload.email}>`,
              subject: 'Recover Password',
              text: mail_template(mail_data, false), // plain text body
              html:  mail_template(mail_data, true) // html body
            }, (err, info) => {
              let msg = `Email was sent to ${request.payload.email}`;
              if (err) {
                msg = `Email was not sent.`;
                log.error('ERROR MAIL:', err)
              }
              return reply(msg);
            });
            //return reply.redirect(`/recover?token=${data.token}`);
        });
    },
    id: 'hyper-recover-password',
    tags: ['api']
};

/**
 * Recover password handler
 * POST /recover_password
 */
handlers.updatePassword = {
    validate: {
        payload: {
            password: joi.string().required(),
            password_confirm: joi.string().required(),
            token: joi.string().required()
        }
    },
    // pre: [
    //   {
    //     method: function(request, reply) {
    //       if (request.payload.password !== request.payload.password_confirm)
    //         reply(Boom.badRequest('Password does not match.'))
    //     }
    //   }
    // ],
    handler: function(request, reply) {
        request.server.methods.services.act({
            role: 'user',
            cmd: 'recover-pass'
        }, {
            password: request.payload.password,
            token: request.payload.token
        }, function(err, data) {
            if (err || !data) {
                log.warn(err, 'Failed generate password recovery token.');
                return reply.redirect('/recover');
            }
            return reply('Password updated successfully.');
        });
    },
    id: 'hyper-update-password',
    tags: ['api']
};

/**
 * Get Access token handler
 * POST /oauth2/token
 */
handlers.getAccessToken = {
    validate: {
        query: {
            client_id: joi.string(),
            client_secret: joi.string(),
            grant_type: joi.string(),
            code: joi.string().optional(),
            refresh_token: joi.string().optional(),
            redirect_uri: joi.string().optional(),
            scope: joi.array().optional()
        }
    },
    handler: function(request, reply) {
      const grant = request.query.grant_type
      if (!['authorization_code', 'refresh_token'].includes(grant)) {
        return reply(new hyperError.InvalidGrant())
      }
      if (grant == 'authorization_code') {
        request.server.methods.services.act({
                role: 'oauthFlow',
                cmd: 'authorization_code_exchange'
            }, {
              client_id: request.query.client_id,
              client_secret: request.query.client_secret,
              code: request.query.code,
              redirect_uri: request.query.redirect_uri
            },
            (err, data) => {
                if (err) return reply(err);
                reply(data.data);
            });
      }
      if (grant == 'refresh_token') {
        request.server.methods.services.act({
                role: 'oauthFlow',
                cmd: 'refresh_token'
            }, {
              client_id: request.query.client_id,
              client_secret: request.query.client_secret,
              refresh_token: request.query.refresh_token,
              scope: request.query.scope
            },
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
      }
    },
    id: 'hyper-oauth-get-access-token',
    tags: ['api']
};

/**
 * Get Access Token handler for password and client credentials
 * POST /token
 */
 handlers.getToken = {
     validate: {
         payload: {
             client_id: joi.string(),
             grant_type: joi.string(),
             client_secret: joi.string().optional(),
             username: joi.string().optional(),
             password: joi.string().optional()
         }
     },
     handler: function(request, reply) {
       const grant = request.payload.response_type
       if (!['client_credentials', 'password'].includes(grant)) {
         return reply(new hyperError.InvalidGrant())
       }
       if (grant == 'client_credentials') {
         request.server.methods.services.act({
                 role: 'oauthFlow',
                 cmd: 'client_credentials'
             }, {
               client: {
                 client_id: request.payload.client_id,
                 client_secret: request.payload.client_secret
               },
               scope: request.payload.scope,
               grant: grant
             },
             (err, data) => {
                 if (err) return reply(err);
                 reply(data);
             });
       }
       if (grant == 'password') {
         request.server.methods.services.act({
                 role: 'oauthFlow',
                 cmd: 'password'
             }, {
               client_id: request.payload.client_id,
               username: request.payload.username,
               password: request.payload.password,
               grant: grant
             },
             (err, data) => {
                 if (err) return reply(err);
                 reply(data);
             });
       }
     },
     id: 'hyper-oauth-get-token',
     tags: ['api']
 };

/**
 * RevokeAccess token handler
 * POST /oauth2/revoke
 */
handlers.revokeAccessToken = {
    auth: {
        strategy: 'hyperToken'
    },
    validate: {
        payload: {
            client_id: joi.string(),
            redirect_uri: joi.string(),
            response_type: joi.string(),
            scope: joi.array().optional()
        }
    },
    handler: function(request, reply) {
        request.server.methods.services.act({
                role: 'oauthFlow',
                cmd: 'revokeToken'
            }, {},
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-oauth-access-token-revoke',
    tags: ['api']
};


/**
 * Get oauth2 clients list handler
 * GET /oauth2/clients
 */
handlers.listClients = {
    auth: {
        strategy: 'hyperToken',
        scope: ['client_read']
    },
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'oauthClient',
                cmd: 'list'
            }, {},
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-oauth-clients-list',
    tags: ['api']
};

/**
 * Get oauth2 client handler
 * GET /oauth2/clients/{id}
 */
handlers.getClient = {
    validate: {
        params: {
            id: joi.number().required()
        }
    },
    auth: {
        strategy: 'hyperToken',
        scope: ['client_read']
    },
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'oauthClient',
                cmd: 'get'
            }, {
                id: request.params.userid
            },
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-oauth2-clients-get',
    tags: ['api']
};

/**
 * Create oauth2 client handler
 * POST /oauth2/clients
 */
handlers.createClient = {
    validate: {},
    auth: {
        strategy: 'hyperToken',
        scope: ['client_create']
    },
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'oauthClient',
                cmd: 'add'
            },
            request.payload,
            (err, data) => {
                if (err) return reply(err);
                reply(data).created();
            });
    },
    id: 'hyper-oauth-clients-add',
    tags: ['api']
};

/**
 * Update oauth2 client handler
 * PUT /oauth2/clients/{id}
 */
handlers.updateClient = {
    validate: {
        params: {
            id: joi.number().required()
        }
    },
    auth: {
        strategy: 'hyperToken',
        scope: ['client_update']
    },
    handler: (request, reply) => {

        let userID = request.params.id;
        let userPayload = request.payload;
        userPayload.id = userID;

        request.server.methods.services.act({
                role: 'oauthClient',
                cmd: 'update'
            }, userPayload,
            (err, data) => {
                if (err) return reply(err);
                reply(data);
            });
    },
    id: 'hyper-oauth-clients-edit',
    tags: ['api']
};

/**
 * Delete oauth client handler
 * DELETE /oauth2/clients/{id}
 */
handlers.removeClient = {
    auth: {
        strategy: 'hyperToken',
        scope: ['client_delete']
    },
    handler: (request, reply) => {
        request.server.methods.services.act({
                role: 'oauthClient',
                cmd: 'delete'
            }, {
                id: request.params.id
            },
            (err, data) => {
                if (err) return reply(err);
                reply();
            });
    },
    id: 'hyper-oauth-clients-delete',
    tags: ['api']
};

module.exports = handlers;
