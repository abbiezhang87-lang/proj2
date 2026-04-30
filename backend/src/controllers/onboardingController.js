const path = require('path');
const fs = require('fs');

const OnboardingApplication = require('../models/OnboardingApplication');
const Document = require('../models/Document');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { httpError } = require('../utils/validators');

// Fields we accept from the client. Anything else is silently dropped so the
// employee can't tamper with status / feedback / documents directly.
const ALLOWED_FIELDS = [
  'firstName', 'lastName', 'middleName', 'preferredName',
  'address', 'cellPhone', 'workPhone',
  'ssn', 'dob', 'gender',
  'isCitizenOrPR', 'residencyType', 'workAuthorization',
  'reference', 'emergencyContacts',
];

function pickFields(body) {
  const out = {};
  for (const k of ALLOWED_FIELDS) if (body[k] !== undefined) out[k] = body[k];
  return out;
}

// GET /api/onboarding/me
exports.getMyApplication = asyncHandler(async (req, res) => {
  const app = await OnboardingApplication.findOne({ user: req.user._id })
    .populate('documents')
    .populate('profilePicture');
  res.json({ application: app, status: app?.status || 'not_submitted' });
});

// POST /api/onboarding/submit
// First-time submission OR resubmission after rejection.
exports.submitApplication = asyncHandler(async (req, res) => {
  const fields = pickFields(req.body);

  // Lock fields: user is always req.user, email is pinned to the User's email,
  // status returns to 'pending' on every (re)submission.
  const update = {
    ...fields,
    user: req.user._id,
    email: req.user.email,
    status: 'pending',
    feedback: '',
  };

  const existing = await OnboardingApplication.findOne({ user: req.user._id });

  // Approved applications are immutable from the employee side.
  if (existing && existing.status === 'approved') {
    throw httpError(409, 'Application already approved');
  }

  let app;
  if (existing) {
    Object.assign(existing, update);
    app = await existing.save();
  } else {
    app = await OnboardingApplication.create(update);
    await User.findByIdAndUpdate(req.user._id, { onboardingApplication: app._id });
  }

  res.status(201).json({ application: app });
});

// POST /api/onboarding/documents   (multipart, single file under field "file")
// Body params: kind (one of Document.KINDS)
exports.uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw httpError(400, 'file is required');
  const { kind } = req.body;
  if (!Document.KINDS.includes(kind)) {
    fs.unlink(req.file.path, () => {}); // clean up the upload
    throw httpError(400, `kind must be one of: ${Document.KINDS.join(', ')}`);
  }

  const app = await OnboardingApplication.findOne({ user: req.user._id });

  const doc = await Document.create({
    user: req.user._id,
    kind,
    originalName: req.file.originalname,
    storedName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });

  // Attach to application if one exists. Profile picture sits on its own field;
  // every other doc goes into the documents array.
  if (app) {
    if (kind === 'profile_picture') {
      app.profilePicture = doc._id;
    } else {
      app.documents.push(doc._id);
    }
    await app.save();
  }

  res.status(201).json({ document: doc });
});

// GET /api/onboarding/documents/:id   (download / preview)
// Same enforcement as employee download — the user must own the doc.
exports.downloadDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) throw httpError(404, 'Document not found');
  if (!doc.user.equals(req.user._id) && req.user.role !== 'hr') {
    throw httpError(403, 'Forbidden');
  }

  const filePath = path.resolve('uploads', doc.storedName);
  if (!fs.existsSync(filePath)) throw httpError(404, 'File missing on disk');

  // ?inline=1 → render in browser (preview); default → download.
  const dispo = req.query.inline ? 'inline' : 'attachment';
  res.setHeader('Content-Type', doc.mimeType);
  res.setHeader(
    'Content-Disposition',
    `${dispo}; filename="${encodeURIComponent(doc.originalName)}"`
  );
  fs.createReadStream(filePath).pipe(res);
});
