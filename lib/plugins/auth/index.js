const AuthBearer = require('hapi-auth-bearer-token');

exports.register = function(server, options, next) {

    server.auth.strategy('hyperToken', 'bearer-access-token', {
        validateFunc: function(token, callback) {
            request.server.methods.services.act({
                    role: 'role',
                    cmd: 'get'
                }, { token: token },
                (err, data) => {
                    if (err || !data) return callback(null, false);
                    return callback(null, true, { token: token }, { artifact: data });
                });
        }
    });

    server.auth.strategy('session', 'cookie', {
        cookie: 'sid',
        password: 'cookie_encryption_password',
        redirectTo: '/login'
    });

    next();
};

exports.register.attributes = {
    name: 'hyper-auth-strategies'
};