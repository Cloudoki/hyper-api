const senecaClient = require('lib/services/senecaClient');

const preConditions = {};

preConditions.hasPermission = (request, callback) => {
    //console.log(requiredPermission, token);
    console.log(request.pre);
    return callback();
    senecaClient.act({
        role: 'user',
        cmd: 'allow'
    }, {
        token: token,
        permission: requiredPermission
    }, function(err, data) {
        if (err) return callback(err);
    });
};


module.exports = preConditions;