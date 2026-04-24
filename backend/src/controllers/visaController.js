// Visa Status Management — employee side (OPT workflow).

exports.getMyVisaStatus = async (_req, res) => {
  // TODO: return the step-machine state for the current user
  res.status(501).json({ message: 'Not implemented: getMyVisaStatus' });
};

exports.uploadNextDocument = async (_req, res) => {
  // TODO: accept next doc (OPT EAD / I-983 / I-20) iff previous is approved
  res.status(501).json({ message: 'Not implemented: uploadNextDocument' });
};
