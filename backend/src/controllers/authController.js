const jwt = require('jsonwebtoken');
const User = require('../models/User');
const tokenService = require('../services/tokenService');
const asyncHandler = require('../utils/asyncHandler');
const { isEmail, httpError } = require('../utils/validators');

function signJwt(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    onboardingApplication: user.onboardingApplication || null,
    visaStatus: user.visaStatus || null,
  };
}

// POST /api/auth/register
// Body: { token, username, password, email }
// Token must match a valid (unused, unexpired) RegistrationToken whose email
// equals the submitted email.
exports.register = asyncHandler(async (req, res) => {
  const { token, username, password, email } = req.body;
  if (!token || !username || !password || !email) {
    throw httpError(400, 'token, username, password, email are required');
  }
  if (!isEmail(email)) throw httpError(400, 'Invalid email format');
  if (password.length < 6) throw httpError(400, 'Password must be at least 6 characters');

  // Trim — copy/paste from the email link sometimes drags in trailing whitespace
  // or newlines, and the DB lookup is exact.
  const tokenDoc = await tokenService.validate(String(token).trim());
  if (tokenDoc.email !== email.toLowerCase().trim()) {
    throw httpError(400, 'Email does not match invitation');
  }

  const user = await User.create({ username, email, password });
  await tokenService.consume(tokenDoc, user._id);

  res.status(201).json({ token: signJwt(user), user: publicUser(user) });
});

// POST /api/auth/login
// Body: { username, password }  (username may also be the email)
exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) throw httpError(400, 'username and password required');

  const query = isEmail(username)
    ? { email: username.toLowerCase().trim() }
    : { username: username.trim() };
  const user = await User.findOne(query);
  if (!user) throw httpError(401, 'Invalid credentials');

  const ok = await user.comparePassword(password);
  if (!ok) throw httpError(401, 'Invalid credentials');

  res.json({ token: signJwt(user), user: publicUser(user) });
});

// GET /api/auth/me   (auth required)
// Used to restore session after a refresh.
exports.me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// POST /api/auth/logout   (auth required)
// Stateless — client just discards token. Endpoint exists for symmetry / future
// blacklisting.
exports.logout = asyncHandler(async (_req, res) => {
  res.json({ ok: true });
});
