const router = require('express').Router();
const ctrl = require('../controllers/visaController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(auth);

// GET   /api/visa/me
// POST  /api/visa/me/documents       (multipart; server picks the next step)
// GET   /api/visa/me/documents/:id   (?inline=1 to preview)

router.get('/me', ctrl.getMyVisaStatus);
router.post('/me/documents', upload.single('file'), ctrl.uploadNextDocument);
router.get('/me/documents/:id', ctrl.downloadDocument);

module.exports = router;
