// Onboarding application — submit / view / resubmit (employee).

exports.getMyApplication = async (_req, res) => {
  // TODO: return current user's application + status
  res.status(501).json({ message: 'Not implemented: getMyApplication' });
};

exports.submitApplication = async (_req, res) => {
  // TODO: create/replace pending application on first submit or rejected resubmit
  res.status(501).json({ message: 'Not implemented: submitApplication' });
};

exports.uploadDocument = async (_req, res) => {
  // TODO: attach uploaded file (multer) to the application
  res.status(501).json({ message: 'Not implemented: uploadDocument' });
};
