const router = require('express').Router();
const ctrl = require('../controllers/authController');
// const auth = require('../middleware/auth');

// POST /api/auth/register     (token-gated)
// POST /api/auth/login
// GET  /api/auth/me           (auth required)
// POST /api/auth/logout

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', /* auth, */ ctrl.me);
router.post('/logout', /* auth, */ ctrl.logout);

module.exports = router;
