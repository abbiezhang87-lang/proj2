const tokenService = require('../services/tokenService');
const emailService = require('../services/emailService');
const OnboardingApplication = require('../models/OnboardingApplication');
const VisaStatus = require('../models/VisaStatus');
const Document = require('../models/Document');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { isEmail, httpError } = require('../utils/validators');

const VALID_STATUS = ['pending', 'approved', 'rejected'];
const VISA_STEP_KEYS = ['optReceipt', 'optEad', 'i983', 'i20'];

// --- Hiring Management — registration tokens ---

exports.generateRegistrationToken = asyncHandler(async (req, res) => {
  const { email, name = '' } = req.body;
  if (!email) throw httpError(400, 'email is required');
  if (!isEmail(email)) throw httpError(400, 'Invalid email format');

  const { tokenDoc, link } = await tokenService.generate(email, name);
  try {
    await emailService.sendRegistrationEmail({ to: email, name, link });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
  res.status(201).json({ token: tokenDoc, link });
});

exports.listTokenHistory = asyncHandler(async (_req, res) => {
  const tokens = await tokenService.listHistory();
  res.json({ tokens });
});

// --- Hiring Management — onboarding application review ---

// GET /api/hr/applications?status=pending|approved|rejected
exports.listApplicationsByStatus = asyncHandler(async (req, res) => {
  const { status } = req.query;
  if (status && !VALID_STATUS.includes(status)) {
    throw httpError(400, `status must be one of: ${VALID_STATUS.join(', ')}`);
  }

  const filter = status ? { status } : {};
  const applications = await OnboardingApplication.find(filter)
    .populate('user', 'username email')
    .populate('profilePicture')
    .populate('documents')
    .sort({ lastName: 1 });

  // Counts for the tab badges.
  const counts = await OnboardingApplication.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const totals = { pending: 0, approved: 0, rejected: 0 };
  counts.forEach((c) => { totals[c._id] = c.count; });

  res.json({ applications, totals });
});

// POST /api/hr/applications/:applicationId/review
// Body: { decision: 'approve' | 'reject', feedback? }
//
// On approve, if the applicant is on F1/OPT, we kick off their VisaStatus
// document with the OPT receipt step pre-populated from the onboarding upload.
exports.reviewApplication = asyncHandler(async (req, res) => {
  const { decision, feedback = '' } = req.body;
  if (!['approve', 'reject'].includes(decision)) {
    throw httpError(400, 'decision must be "approve" or "reject"');
  }

  const app = await OnboardingApplication.findById(req.params.applicationId);
  if (!app) throw httpError(404, 'Application not found');
  if (app.status !== 'pending') {
    throw httpError(409, `Application is already ${app.status}`);
  }

  if (decision === 'reject') {
    if (!feedback.trim()) throw httpError(400, 'feedback required when rejecting');
    app.status = 'rejected';
    app.feedback = feedback.trim();
    await app.save();
    return res.json({ application: app });
  }

  // Approve.
  app.status = 'approved';
  app.feedback = '';
  await app.save();

  // Spin up VisaStatus only for F1/OPT employees.
  const isOPT = app.workAuthorization?.type === 'F1';
  if (isOPT) {
    let visa = await VisaStatus.findOne({ user: app.user });
    if (!visa) {
      // Find the OPT receipt document the employee uploaded.
      const receipt = await Document.findOne({
        user: app.user,
        kind: 'opt_receipt',
      }).sort({ createdAt: -1 });

      visa = await VisaStatus.create({
        user: app.user,
        optReceipt: receipt
          ? { document: receipt._id, status: 'pending', uploadedAt: receipt.createdAt }
          : { status: 'not_uploaded' },
      });

      await User.findByIdAndUpdate(app.user, { visaStatus: visa._id });
    }
  }

  res.json({ application: app });
});

// --- Employee Profiles ---

// GET /api/hr/employees?search=&page=1&limit=20
exports.listEmployees = asyncHandler(async (req, res) => {
  const search = (req.query.search || '').trim();
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);

  const matchSearch = search
    ? {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { preferredName: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  const filter = { status: 'approved', ...matchSearch };

  const total = await OnboardingApplication.countDocuments(filter);
  const apps = await OnboardingApplication.find(filter)
    .populate('user', 'username email')
    .sort({ lastName: 1, firstName: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  // Project just the summary view fields the spec asks for.
  const employees = apps.map((a) => ({
    id: a._id,
    userId: a.user?._id,
    fullName: [a.firstName, a.middleName, a.lastName].filter(Boolean).join(' '),
    ssn: a.ssn,
    workAuthTitle: a.workAuthorization?.type === 'Other'
      ? a.workAuthorization?.otherTitle
      : a.workAuthorization?.type || (a.isCitizenOrPR ? a.residencyType : ''),
    phone: a.cellPhone,
    email: a.email,
  }));

  res.json({ employees, total, page, limit });
});

// GET /api/hr/employees/:employeeId
exports.getEmployeeProfile = asyncHandler(async (req, res) => {
  const app = await OnboardingApplication.findOne({ user: req.params.employeeId })
    .populate('user', 'username email role')
    .populate('profilePicture')
    .populate('documents');

  if (!app) throw httpError(404, 'Employee not found');
  res.json({ application: app });
});

// --- Visa Status Management ---

// GET /api/hr/visa/in-progress
// Lists OPT employees with at least one un-approved step.
exports.listVisaInProgress = asyncHandler(async (_req, res) => {
  const visas = await VisaStatus.find()
    .populate({
      path: 'user',
      select: 'username email',
    });

  const out = [];
  for (const v of visas) {
    const next = v.nextStep();
    if (!next) continue; // fully approved — skip

    const app = await OnboardingApplication.findOne({ user: v.user._id });
    if (!app) continue;

    const wa = app.workAuthorization || {};
    const daysRemaining = wa.endDate
      ? Math.max(0, Math.ceil((new Date(wa.endDate) - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

    out.push({
      userId: v.user._id,
      visaStatusId: v._id,
      fullName: [app.firstName, app.middleName, app.lastName].filter(Boolean).join(' '),
      workAuth: {
        type: wa.type,
        startDate: wa.startDate,
        endDate: wa.endDate,
        daysRemaining,
      },
      nextStep: next,
      currentStepStatus: v[next].status,
      currentStepDocument: v[next].document,
    });
  }

  res.json({ employees: out });
});

// GET /api/hr/visa/all?search=
exports.listVisaAll = asyncHandler(async (req, res) => {
  const search = (req.query.search || '').trim();
  const visas = await VisaStatus.find().populate('user', 'username email');

  const out = [];
  for (const v of visas) {
    const app = await OnboardingApplication.findOne({ user: v.user._id })
      .populate('documents');
    if (!app) continue;

    const fullName = [app.firstName, app.middleName, app.lastName].filter(Boolean).join(' ');
    if (search) {
      const haystack = `${fullName} ${app.preferredName || ''}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) continue;
    }

    const approvedDocs = VISA_STEP_KEYS
      .filter((k) => v[k].status === 'approved' && v[k].document)
      .map((k) => ({ step: k, documentId: v[k].document }));

    out.push({
      userId: v.user._id,
      fullName,
      workAuth: app.workAuthorization,
      approvedDocs,
    });
  }

  res.json({ employees: out });
});

// POST /api/hr/visa/:userId/:step/review
// Body: { decision: 'approve' | 'reject', feedback? }
exports.reviewVisaDocument = asyncHandler(async (req, res) => {
  const { userId, step } = req.params;
  const { decision, feedback = '' } = req.body;

  if (!VISA_STEP_KEYS.includes(step)) {
    throw httpError(400, `step must be one of: ${VISA_STEP_KEYS.join(', ')}`);
  }
  if (!['approve', 'reject'].includes(decision)) {
    throw httpError(400, 'decision must be "approve" or "reject"');
  }

  const visa = await VisaStatus.findOne({ user: userId });
  if (!visa) throw httpError(404, 'Visa status not found');
  if (visa[step].status !== 'pending') {
    throw httpError(409, `Step is currently "${visa[step].status}", not pending`);
  }

  if (decision === 'reject') {
    if (!feedback.trim()) throw httpError(400, 'feedback required when rejecting');
    visa[step].status = 'rejected';
    visa[step].feedback = feedback.trim();
  } else {
    visa[step].status = 'approved';
    visa[step].feedback = '';
  }
  visa[step].reviewedAt = new Date();
  await visa.save();

  res.json({ visaStatus: visa });
});

// POST /api/hr/visa/:userId/notify
// Sends a "next step" reminder email to the employee.
exports.sendNextStepNotification = asyncHandler(async (req, res) => {
  const visa = await VisaStatus.findOne({ user: req.params.userId }).populate('user');
  if (!visa) throw httpError(404, 'Visa status not found');

  const next = visa.nextStep();
  if (!next) throw httpError(400, 'All visa steps already approved');

  const messages = {
    optReceipt: 'Please upload your OPT Receipt.',
    optEad: 'Please upload your OPT EAD.',
    i983: 'Please complete and upload your I-983 form.',
    i20: 'Please send the I-983 to your school and upload the new I-20.',
  };

  try {
    await emailService.sendNextStepEmail({
      to: visa.user.email,
      nextStepText: messages[next],
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }

  res.json({ ok: true, nextStep: next });
});
