const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Reads `Authorization: Bearer <token>`, verifies JWT, attaches the User to
// req.user. Returns 401 on missing/invalid token.
module.exports = async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Missing or malformed token' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_e) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'User no longer exists' });

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
};
