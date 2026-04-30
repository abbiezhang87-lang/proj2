const nodemailer = require('nodemailer');

// Lazy transporter so the app boots even when SMTP env vars aren't set.
let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) {
    console.warn('SMTP not configured — emails will be logged to stdout only');
    transporter = {
      sendMail: async (msg) => {
        console.log('[email:dev]', msg);
        return { messageId: 'dev-' + Date.now() };
      },
    };
    return transporter;
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  return transporter;
}

const FROM = process.env.EMAIL_FROM || 'HR <hr@example.com>';

async function sendRegistrationEmail({ to, name, link }) {
  const greet = name ? `Hi ${name},` : 'Hi,';
  return getTransporter().sendMail({
    from: FROM,
    to,
    subject: 'Complete your onboarding registration',
    text: `${greet}

You've been invited to register for our employee portal. Click the link below
to create your account. This invitation expires in 3 hours.

${link}

If you didn't expect this email, you can safely ignore it.`,
  });
}

async function sendNextStepEmail({ to, nextStepText }) {
  return getTransporter().sendMail({
    from: FROM,
    to,
    subject: 'Action required for your visa documents',
    text: `Hi,

A reminder about your next step: ${nextStepText}

Please log in to the portal to continue.`,
  });
}

module.exports = { sendRegistrationEmail, sendNextStepEmail };
