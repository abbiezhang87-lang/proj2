// Central error handler — last middleware in app.js.
// TODO: shape errors, hide stack in production.

// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, _req, res, _next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
};
