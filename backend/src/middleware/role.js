// Role gate — use after `auth`. Usage: router.use(requireRole('hr'))
// TODO: check req.user.role === expected.

module.exports = function requireRole(_expected) {
  return (_req, res, _next) => {
    res.status(501).json({ message: 'Not implemented: role middleware' });
  };
};
