'use strict'

const config = require('config');
const log = require('util/log');

const mq = require('hyper-queue');
log.fatal('##### Starting Hyper API #####');
mq.logger(log);

mq.broker(config.queue.uri, config.queue.options, config.queue.reconnect);

mq.connect();

const serverMethods = {};

serverMethods.query = () => {

};