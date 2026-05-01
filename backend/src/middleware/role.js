// Role gate. Use after `auth`:
//   router.use(auth, requireRole('hr'))
module.exports = function requireRole(expected) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (req.user.role !== expected) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
