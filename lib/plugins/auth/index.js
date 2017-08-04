const AuthBearer = require('hapi-auth-bearer-token');

exports.register = function(server, options, next) {

    // Bearer strategy
    server.auth.strategy('hyperToken', 'bearer-access-token', {
        validateFunc: function(token, callback) {
            console.log('validating token', token);
            server.methods.services.act({
                    role: 'authorization',
                    cmd: 'get'
                }, { token: token },
                (err, data) => {
                    console.log('error', err)
                    console.log('data', data);
                    if (err || !data) return callback(null, false);

                    return callback(null, true, { token: token, scope: data }, { artifact: data });
                });
        }
    });

    // Session strategy
    const cache = server.cache({
        segment: 'sessions',
        expiresIn: 3 * 24 * 60 * 60 * 1000
    });

    server.app.cache = cache;

    server.auth.strategy('session', 'cookie', {
        cookie: 'sid',
        password: 'jGtuoI*UqFkAmeqRlm^Tyh1h7$5OuN73',
        redirectTo: '/oauth2/authenticate',
        isSecure: false,
        appendNext: true,
        validateFunc: function(request, session, callback) {
            console.log('Checking session');
            cache.get(session.sid, (err, cached) => {

                if (err) {
                    console.log('session err', err);
                    return callback(err, false);
                }

                if (!cached) {
                    console.log('not cached');
                    return callback(null, false);
                }

                return callback(null, true, cached.account);
            });
        }
    });

    next();
};

exports.register.attributes = {
    name: 'hyper-auth-strategies'
};