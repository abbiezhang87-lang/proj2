// Employee — personal info page (view + per-section edit).

exports.getMyProfile = async (_req, res) => {
  // TODO: return full personal-info view for req.user
  res.status(501).json({ message: 'Not implemented: getMyProfile' });
};

exports.updateSection = async (_req, res) => {
  // TODO: PATCH a single section (name / address / contact / employment / emergency)
  res.status(501).json({ message: 'Not implemented: updateSection' });
};

exports.listMyDocuments = async (_req, res) => {
  // TODO: list this user's uploaded documents
  res.status(501).json({ message: 'Not implemented: listMyDocuments' });
};

exports.downloadDocument = async (_req, res) => {
  // TODO: stream file back; enforce ownership (spec §Good Practices)
  res.status(501).json({ message: 'Not implemented: downloadDocument' });
};
