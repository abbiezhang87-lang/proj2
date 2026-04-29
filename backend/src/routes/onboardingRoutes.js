const router = require('express').Router();
const ctrl = require('../controllers/onboardingController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require auth.
router.use(auth);

// GET    /api/onboarding/me
// POST   /api/onboarding/submit
// POST   /api/onboarding/documents          (multipart; field "file", body "kind")
// GET    /api/onboarding/documents/:id      (?inline=1 to preview)

router.get('/me', ctrl.getMyApplication);
router.post('/submit', ctrl.submitApplication);
router.post('/documents', upload.single('file'), ctrl.uploadDocument);
router.get('/documents/:id', ctrl.downloadDocument);

module.exports = router;
