'use strict'

const log = require('util/logger');

const nodemailer = require('nodemailer');
const config = require('config');
const mailerConfig = config.get('mailer');

const transporter = nodemailer.createTransport(mailerConfig);

transporter.verify((err, success) => {
  if (err) {
    log.error('Failed to verify mailer configuration.', err, mailerConfig);
  }
});

exports = module.exports = transporter;
