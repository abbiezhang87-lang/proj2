const crypto = require('crypto');
const RegistrationToken = require('../models/RegistrationToken');
const { httpError } = require('../utils/validators');

const TTL_HOURS = Number(process.env.REGISTRATION_TOKEN_TTL_HOURS || 3);

// HR generates a token and email link. Returns { tokenDoc, link }.
async function generate(email, name = '') {
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000);

  const tokenDoc = await RegistrationToken.create({
    email: email.toLowerCase().trim(),
    name: name.trim(),
    token,
    expiresAt,
  });

  const base = process.env.FRONTEND_URL || 'http://localhost:3000';
  const link = `${base}/register?token=${token}`;
  return { tokenDoc, link };
}

// Throws 400 if the token doesn't exist, is used, or is expired.
async function validate(token) {
  const doc = await RegistrationToken.findOne({ token });
  if (!doc) throw httpError(400, 'Invalid registration token');
  if (doc.used) throw httpError(400, 'This invitation has already been used');
  if (doc.expiresAt <= new Date()) throw httpError(400, 'Invitation has expired');
  return doc;
}

// Mark a token used and link to the freshly-created user.
async function consume(tokenDoc, userId) {
  tokenDoc.used = true;
  tokenDoc.user = userId;
  await tokenDoc.save();
  return tokenDoc;
}

// HR-facing: list every invitation ever sent.
async function listHistory() {
  return RegistrationToken.find()
    .sort({ createdAt: -1 })
    .populate('user', 'username email');
}

module.exports = { generate, validate, consume, listHistory };
