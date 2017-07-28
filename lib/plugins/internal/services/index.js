'use strict'

const senecaClient = {
    act: function(err, ob) {
        console.log('done something');
    }
};
//require('./senecaClient');

exports.register = function(server, options, next) {

    server.method('services.act', senecaClient.act);

    //senecaClient.connect(next);
    next();
}

exports.register.attributes = {
    name: 'Services consumer'
};