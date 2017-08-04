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
                    env: 'HYPER_API_DEFAULT_CORS_ORIGINS',
                    default: []
                },
                additionalHeaders: {
                    doc: 'Server default CORS headers',
                    format: Array,
                    env: 'HYPER_API_DEFAULT_CORS_HEADERS',
                    default: []
                }
            }
        }
    },
    seneca: {
        options: {
            debug: {
                deprecation: {
                    doc: 'Seneca debugging option, warn for deprecations',
                    format: Boolean,
                    default: true
                },
                undead: {
                    doc: 'Seneca debugging option, warn for deprecations',
                    format: Boolean,
                    default: false
                },
                short_logs: {
                    doc: 'Seneca debugging option, internal log format',
                    format: Boolean,
                    default: true
                }
            },
            log: {
                level: {
                    doc: 'Internal Seneca logger level',
                    format: String,
                    default: 'fatal'
                }
            },
            plugin: {
                doc: 'Seneca Plugin namespace options',
                format: Object,
                env: 'HYPER_API_SENECA_PLUGIN_OPTS',
                default: {}
            },
            strict: {
                result: {
                    doc: 'The result provided by an action must be an Object or an Array that can be fully serialized to JSON.When false scalar values (Strings, Numbers, etc) are permitted. Use only to keep old code working while you migrate.',
                    format: Boolean,
                    env: 'HYPER_API_SENECA_OPTS_STRICT_RESULT',
                    default: true
                }
            },
            tag: {
                doc: 'Seneca Plugin namespace options',
                format: String,
                env: 'HYPER_API_SENECA_PLUGIN_OPTS'
            },
            test: {

            },
            timeout: {
                doc: 'Seneca default timeout options',
                format: 'int',
                env: 'HYPER_API_SENECA_OPTS_TIMEOUT',
                default: 5000
            }
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
                env: 'HYPER_API_BROKER_URL',
                default: 'amqp://localhost/'
            },
            pins: {
                doc: 'Seneca services pins',
                format: Array,
                env: 'HYPER_API_ENABLED_PINS',
                default: [
                    'role:account',
                    'role:permission',
                    'role:role',
                    'role:user',
                    'role:authorization',
                    'role:oauthClient'
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
            'inert',
            'vision',
            'hapi-auth-cookie',
            'hapi-auth-bearer-token',
            'lib/plugins/auth',
            'lib/plugins/permissions',
            'lib/plugins/oauth2',
            'lib/plugins/users',
            'lib/plugins/superadmin',
            'lib/plugins/accounts',
            'lib/plugins/roles',
            'lib/plugins/internal/services',
            'lib/plugins/internal/swagger',
            'lib/plugins/internal/good'
        ]
    }
};

module.exports = schema;