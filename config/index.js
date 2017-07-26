'use strict'

const convict = require('convict');

// Define a schema
const schema = require('config/schema');
const config = convict(schema);

// Load environment dependent configuration
var env = config.get('env');

// If production use session vars instead
if (env !== 'production') {
    config.loadFile('./config/envs/' + env + '.json');
}

// Perform validation
//config.validate({
// allowed: 'strict'
//});

module.exports = config;