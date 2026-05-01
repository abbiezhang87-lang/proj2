// Central error handler. Express recognises 4-arg fn as the error handler.
// Place this AFTER all route mounts in app.js.

// Format mongoose/JWT errors into clean 4xx responses; everything else → 500.
// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, _req, res, _next) {
  // Mongoose validation
  if (err.name === 'ValidationError') {
    const fields = {};
    for (const [k, v] of Object.entries(err.errors || {})) fields[k] = v.message;
    return res.status(400).json({ message: 'Validation failed', fields });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `${field} already exists` });
  }

  // Cast (bad ObjectId in :id params)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}` });
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: err.message || 'Server error' });
};
