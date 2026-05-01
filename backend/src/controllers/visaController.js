const fs = require('fs');
const path = require('path');

const VisaStatus = require('../models/VisaStatus');
const Document = require('../models/Document');
const asyncHandler = require('../utils/asyncHandler');
const { httpError } = require('../utils/validators');

// Step → document kind mapping.
const STEP_KIND = {
  optReceipt: 'opt_receipt',
  optEad: 'opt_ead',
  i983: 'i983',
  i20: 'i20',
};

// GET /api/visa/me
exports.getMyVisaStatus = asyncHandler(async (req, res) => {
  const visa = await VisaStatus.findOne({ user: req.user._id })
    .populate('optReceipt.document')
    .populate('optEad.document')
    .populate('i983.document')
    .populate('i20.document');

  if (!visa) {
    return res.json({ visaStatus: null, nextStep: null });
  }
  res.json({ visaStatus: visa, nextStep: visa.nextStep() });
});

// POST /api/visa/me/documents
// Multipart: field "file"
// Server figures out which step the upload applies to (it's always the next
// non-approved step), so the employee can't skip ahead.
exports.uploadNextDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw httpError(400, 'file is required');

  const visa = await VisaStatus.findOne({ user: req.user._id });
  if (!visa) {
    fs.unlink(req.file.path, () => {});
    throw httpError(404, 'No visa status — onboarding must be approved first');
  }

  const step = visa.nextStep();
  if (!step) {
    fs.unlink(req.file.path, () => {});
    throw httpError(409, 'All steps already approved');
  }

  // Sequential rule: the next step must be either not_uploaded or rejected.
  // (pending = waiting on HR; we don't allow re-upload while pending.)
  const cur = visa[step].status;
  if (cur !== 'not_uploaded' && cur !== 'rejected') {
    fs.unlink(req.file.path, () => {});
    throw httpError(409, `Step ${step} is currently "${cur}" — cannot upload`);
  }

  // Special case: optReceipt is created during onboarding approval. If the
  // employee re-uploads it (e.g. after rejection), accept it here too.
  const doc = await Document.create({
    user: req.user._id,
    kind: STEP_KIND[step],
    originalName: req.file.originalname,
    storedName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });

  visa[step].document = doc._id;
  visa[step].status = 'pending';
  visa[step].feedback = '';
  visa[step].uploadedAt = new Date();
  await visa.save();

  res.status(201).json({ visaStatus: visa, document: doc, step });
});

// GET /api/visa/me/documents/:id  (employee-side preview/download)
// Same ownership enforcement as elsewhere.
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
