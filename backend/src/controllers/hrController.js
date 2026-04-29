const tokenService = require('../services/tokenService');
const emailService = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');
const { isEmail, httpError } = require('../utils/validators');

// POST /api/hr/tokens
// Body: { email, name? }
// Generates a registration token, emails the link to the new hire, and stores
// a row in RegistrationToken history.
exports.generateRegistrationToken = asyncHandler(async (req, res) => {
  const { email, name = '' } = req.body;
  if (!email) throw httpError(400, 'email is required');
  if (!isEmail(email)) throw httpError(400, 'Invalid email format');

  const { tokenDoc, link } = await tokenService.generate(email, name);

  try {
    await emailService.sendRegistrationEmail({ to: email, name, link });
  } catch (err) {
    // Don't fail the request — log and return the link so HR can resend by hand.
    console.error('Email send failed:', err.message);
  }

  res.status(201).json({ token: tokenDoc, link });
});

// GET /api/hr/tokens
exports.listTokenHistory = asyncHandler(async (_req, res) => {
  const tokens = await tokenService.listHistory();
  res.json({ tokens });
});

// --- Stubs for later phases (left intentionally not-implemented for now) ---

exports.listEmployees = asyncHandler(async (_req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

exports.getEmployeeProfile = asyncHandler(async (_req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

exports.listApplicationsByStatus = asyncHandler(async (_req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

exports.reviewApplication = asyncHandler(async (_req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

exports.listVisaInProgress = asyncHandler(async (_req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

exports.listVisaAll = asyncHandler(async (_req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

exports.reviewVisaDocument = asyncHandler(async (_req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

exports.sendNextStepNotification = asyncHandler(async (_req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});
