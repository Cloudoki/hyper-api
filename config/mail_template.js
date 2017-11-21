'use strict'

const log = require('util/logger');

const template = (args, html) => {
  let mail = `Hey ${args.username},\n
  Someone requested a new password for you account.\n
  \n
  Copyable link: ${args.recoveryURL}\n
  \n
  This link is good only for the next 12h and can only be used once.\n
  \n
  If you didn't request this, you can ignore this email or let us know. Your password won't change until you create a new password.`
  if (html) {
      mail = `Hey <strong>${args.username}</strong>,\n<br>
      Someone requested a new password for you account.\n<br>
      \n<br>
      <a href=${args.recoveryURL}>Reset Password</a>\n<br>
      or\n<br>
      <small>Copyable link: ${args.recoveryURL}</small>\n<br>
      \n<br>
      <i>This link is good only for the next 12h and can only be used once.</i>\n<br>
      \n<br>
      If you didn't request this, you can ignore this email or let us know. Your password won't change until you create a new password.`
  }
  return mail;
};

exports = module.exports = template;
