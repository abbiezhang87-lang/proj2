const fs = require('fs');
const path = require('path');

const OnboardingApplication = require('../models/OnboardingApplication');
const Document = require('../models/Document');
const asyncHandler = require('../utils/asyncHandler');
const { httpError } = require('../utils/validators');

// Whitelisted fields per Personal Information section. Employees can only
// edit these post-approval; status / feedback / user are off-limits.
const SECTION_FIELDS = {
  name: ['firstName', 'lastName', 'middleName', 'preferredName'],
  address: ['address'],
  contact: ['cellPhone', 'workPhone'],
  employment: ['workAuthorization'],
  emergency: ['emergencyContacts'],
};

// GET /api/employees/me
exports.getMyProfile = asyncHandler(async (req, res) => {
  const app = await OnboardingApplication.findOne({ user: req.user._id })
    .populate('profilePicture')
    .populate('documents');
  if (!app) throw httpError(404, 'No application found');
  res.json({ profile: app });
});

// PATCH /api/employees/me/:section
// Body: only the fields allowed for that section.
// Available only after the application is approved.
exports.updateSection = asyncHandler(async (req, res) => {
  const { section } = req.params;
  const allowed = SECTION_FIELDS[section];
  if (!allowed) {
    throw httpError(400, `section must be one of: ${Object.keys(SECTION_FIELDS).join(', ')}`);
  }

  const app = await OnboardingApplication.findOne({ user: req.user._id });
  if (!app) throw httpError(404, 'No application found');
  if (app.status !== 'approved') {
    throw httpError(403, 'Personal info edits are only allowed after approval');
  }

  // Apply only the whitelisted fields.
  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }
  Object.assign(app, update);
  await app.save();

  res.json({ profile: app });
});

// GET /api/employees/me/documents
exports.listMyDocuments = asyncHandler(async (req, res) => {
  const docs = await Document.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ documents: docs });
});

// GET /api/employees/me/documents/:id   (?inline=1 to preview)
exports.downloadDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) throw httpError(404, 'Document not found');
  if (!doc.user.equals(req.user._id) && req.user.role !== 'hr') {
    throw httpError(403, 'Forbidden');
  }
  const filePath = path.resolve('uploads', doc.storedName);
  if (!fs.existsSync(filePath)) throw httpError(404, 'File missing on disk');

  const dispo = req.query.inline ? 'inline' : 'attachment';
  res.setHeader('Content-Type', doc.mimeType);
  res.setHeader(
    'Content-Disposition',
    `${dispo}; filename="${encodeURIComponent(doc.originalName)}"`
  );
  fs.createReadStream(filePath).pipe(res);
});
