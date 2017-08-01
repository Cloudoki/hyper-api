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
        env: 'HYPER_API_PUBLIC_HOST'
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
        },
        routes: {
            cors: {
                origin: {
                    doc: 'Server default CORS origin',
                    format: Array,
                    env: 'HYPER_API_DEFAULT_CORS_ORIGINS'
                },
                additionalHeaders: {
                    doc: 'Server default CORS headers',
                    format: Array,
                    env: 'HYPER_API_DEFAULT_CORS_HEADERS'
                }
            }
        }
    },
    seneca: {
        options: {
            doc: 'Seneca default options',
            format: Object,
            env: 'HYPER_API_SENECA_OPTS',
            default: {}
        },

        client: {
            type: {
                doc: 'Seneca CORS origin',
                format: String,
                env: 'HYPER_API_SENECA_CLIENT_TYPE',
                default: 'amqp'
            },
            url: {
                doc: 'Seneca broker connection url',
                format: String,
                env: 'HYPER_API_BROKER_URL'
            },
            pins: {
                doc: 'Seneca services pins',
                format: Array,
                env: 'HYPER_API_ENABLED_PINS',
                default: [
                    'role:account',
                    'role:permission',
                    'role:role',
                    'role:user'
                ]
            }
        },
        rabbitOptions: {
            doc: 'Seneca Rabbit connector default options',
            format: Object,
            env: 'HYPER_API_SENECA_RABBIT_CONNECTOR_OPTS',
            default: {}
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
    },
    plugins: {
        doc: 'Plugins to load',
        format: Array,
        env: 'HYPER_API_ENABLED_PLUGINS',
        default: [
            'lib/plugins/users',
            'lib/plugins/accounts',
            'lib/plugins/roles',
            'lib/plugins/permissions',
            'inert',
            'vision',
            'lib/plugins/internal/services',
            'lib/plugins/internal/swagger',
            'lib/plugins/internal/good'
        ]
    }
};

module.exports = schema;