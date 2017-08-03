const AuthBearer = require('hapi-auth-bearer-token');

exports.register = function(server, options, next) {

    server.auth.strategy('hyperToken', 'bearer-access-token', {

        validateFunc: function(token, callback) {

            console.log(arguments);
        }
    });

    next();
};

exports.register.attributes = {
    name: 'hyper-auth-strategies'
};