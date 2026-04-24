// JWT auth middleware — reads `Authorization: Bearer <token>`, sets req.user.
// TODO: implement token verification + lookup of User.

module.exports = function auth(_req, res, _next) {
  res.status(501).json({ message: 'Not implemented: auth middleware' });
};
