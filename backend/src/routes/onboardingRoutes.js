const router = require('express').Router();
const ctrl = require('../controllers/onboardingController');
// const auth = require('../middleware/auth');
// const upload = require('../middleware/upload');

// GET    /api/onboarding/me
// POST   /api/onboarding/submit
// POST   /api/onboarding/documents   (multipart, single file)

router.get('/me', /* auth, */ ctrl.getMyApplication);
router.post('/submit', /* auth, */ ctrl.submitApplication);
router.post('/documents', /* auth, upload.single('file'), */ ctrl.uploadDocument);

module.exports = router;
