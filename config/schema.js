'use strict'

const schema = {
    env: {
        doc: 'The API environment.',
        format: ['production', 'staging', 'development'],
        default: 'development',
        env: 'HYPER_API_NODE_ENV'
    },
    publicHost: {
        doc: 'The public http address.',
        format: String,
        default: 'http://localhost/',
        env: 'HYPER_API_PUBLIC_HOST',
    },
    server: {
        host: {
            doc: 'The IP address to bind.',
            format: 'ipaddress',
            default: '0.0.0.0',
            env: 'HYPER_API_IP_ADDRESS',
        },
        port: {
            doc: 'The port to bind.',
            format: 'port',
            default: 3000,
            env: 'HYPER_API_PORT'
        }
    },
    queue: {
        uri: {
            doc: 'Rabbit broker connection string',
            format: String,
            env: 'HYPER_API_RABBIT_CONNECTION_STRING'
        },
        reconnectTime: {
            doc: 'Rabbit broker reconnect timer',
            format: 'int',
            default: 3000
        },
        options: {
            cert: {
                doc: 'Path to SSL key',
                format: String,
                env: 'HYPER_API_RABBIT_SSL_CERT'
            },
            key: {
                doc: 'Rabbit connection key',
                format: String,
                env: 'HYPER_API_RABBIT_SSL_KEY'
            },
            passphrase: {
                doc: 'RAbbit connection SSL passpharase',
                format: String,
                env: 'HYPER_API_RABBIT_SSL_PASSPHRASE'
            },
            ca: {
                doc: 'Path to root certificate authority file',
                format: String,
                env: 'HYPER_API_RABBIT_SSL_CA'
            }
        }
    },
    logger: {
        name: {
            doc: 'API logger name',
            format: String,
            default: 'Hyper-API'
        },
        level: {
            doc: 'Logger level',
            format: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
            default: 'trace'
        }
    }
};

module.exports = schema;