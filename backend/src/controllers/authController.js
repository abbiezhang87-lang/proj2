// Auth — registration (via token), login, session check.

exports.register = async (_req, res) => {
  // TODO: validate registration token, create User, mark token used
  res.status(501).json({ message: 'Not implemented: register' });
};

exports.login = async (_req, res) => {
  // TODO: verify credentials, return JWT + user role
  res.status(501).json({ message: 'Not implemented: login' });
};

exports.me = async (_req, res) => {
  // TODO: return current user from req.user (set by auth middleware)
  res.status(501).json({ message: 'Not implemented: me' });
};

exports.logout = async (_req, res) => {
  // TODO: stateless JWT — client just drops token; optionally blacklist
  res.status(501).json({ message: 'Not implemented: logout' });
};
