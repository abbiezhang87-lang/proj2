// HR — profiles, hiring management, visa review.

// --- Employee Profiles ---
exports.listEmployees = async (_req, res) => {
  // TODO: return summary list sorted by last name, with count + search filter
  res.status(501).json({ message: 'Not implemented: listEmployees' });
};

exports.getEmployeeProfile = async (_req, res) => {
  // TODO: return full profile of :employeeId
  res.status(501).json({ message: 'Not implemented: getEmployeeProfile' });
};

// --- Hiring Management: Registration Tokens ---
exports.generateRegistrationToken = async (_req, res) => {
  // TODO: create token (3h TTL), email link, store history row
  res.status(501).json({ message: 'Not implemented: generateRegistrationToken' });
};

exports.listTokenHistory = async (_req, res) => {
  // TODO: return all tokens w/ email, name, link, submitted-or-not
  res.status(501).json({ message: 'Not implemented: listTokenHistory' });
};

// --- Hiring Management: Onboarding Review ---
exports.listApplicationsByStatus = async (_req, res) => {
  // TODO: req.query.status ∈ {pending, approved, rejected}
  res.status(501).json({ message: 'Not implemented: listApplicationsByStatus' });
};

exports.reviewApplication = async (_req, res) => {
  // TODO: approve/reject application; optional feedback on reject
  res.status(501).json({ message: 'Not implemented: reviewApplication' });
};

// --- Visa Status Management (HR side) ---
exports.listVisaInProgress = async (_req, res) => {
  // TODO: employees with outstanding OPT steps + next-step label
  res.status(501).json({ message: 'Not implemented: listVisaInProgress' });
};

exports.listVisaAll = async (_req, res) => {
  // TODO: every visa-status employee w/ approved docs
  res.status(501).json({ message: 'Not implemented: listVisaAll' });
};

exports.reviewVisaDocument = async (_req, res) => {
  // TODO: approve/reject a specific step (receipt/ead/i983/i20)
  res.status(501).json({ message: 'Not implemented: reviewVisaDocument' });
};

exports.sendNextStepNotification = async (_req, res) => {
  // TODO: email the employee reminding them of their next OPT step
  res.status(501).json({ message: 'Not implemented: sendNextStepNotification' });
};
