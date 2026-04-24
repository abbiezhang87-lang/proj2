// Nodemailer wrapper — used for registration links + HR notifications.
// TODO: build transporter from SMTP_* env vars, add templates.

// const nodemailer = require('nodemailer');

async function sendRegistrationEmail(_to, _link) {
  // TODO
  throw new Error('Not implemented: sendRegistrationEmail');
}

async function sendNextStepEmail(_to, _nextStepText) {
  // TODO
  throw new Error('Not implemented: sendNextStepEmail');
}

module.exports = { sendRegistrationEmail, sendNextStepEmail };
