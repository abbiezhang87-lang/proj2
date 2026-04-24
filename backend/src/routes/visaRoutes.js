const router = require('express').Router();
const ctrl = require('../controllers/visaController');
// const auth = require('../middleware/auth');
// const upload = require('../middleware/upload');

// GET   /api/visa/me
// POST  /api/visa/me/documents      (multipart; server enforces step order)

router.get('/me', /* auth, */ ctrl.getMyVisaStatus);
router.post('/me/documents', /* auth, upload.single('file'), */ ctrl.uploadNextDocument);

module.exports = router;
