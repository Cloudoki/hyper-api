exports = module.exports = {
    port: process.env.HYPER_PORT || 3000,
    swagger: {
        enabled: true
    },
    logger: {
        name: process.env.HYPER_WORKER_USER_LOGGER_NAME || 'HYPER-API',
        level: process.env.HYPER_WORKER_USER_LOGGER_LEVEL || 'debug'
    },
    queue: {
        uri: process.env.HYPER_WORKER_USER_QUEUE_URI || 'amqps://mq.dev.cloudoki.com',
        reconnect: process.env.HYPER_WORKER_USER_QUEUE_RECONNECT || 5000,
        options: {
            cert: process.env.HYPER_WORKER_USER_QUEUE_CERT || '/Users/tomasfoglio/Cloudoki/donderstarter-api/ssl/client/cert.pem',
            key: process.env.HYPER_WORKER_USER_QUEUE_KEY || '/Users/tomasfoglio/Cloudoki/donderstarter-api/ssl/client/key.pem',
            passphrase: process.env.HYPER_WORKER_USER_QUEUE_CERT_PASS || 'cloudoki',
            ca: process.env.HYPER_WORKER_USER_QUEUE_CA || '/Users/tomasfoglio/Cloudoki/donderstarter-api/ssl/ca/cacert.pem'
        }
    }
};
