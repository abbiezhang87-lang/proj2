const router = require('express').Router();
const ctrl = require('../controllers/hrController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

// All HR endpoints require auth + HR role.
router.use(auth, requireRole('hr'));

// --- Hiring Management — registration tokens (live) ---
router.post('/tokens', ctrl.generateRegistrationToken);
router.get('/tokens', ctrl.listTokenHistory);

// --- Stubs for later phases ---
router.get('/employees', ctrl.listEmployees);
router.get('/employees/:employeeId', ctrl.getEmployeeProfile);

router.get('/applications', ctrl.listApplicationsByStatus);
router.post('/applications/:applicationId/review', ctrl.reviewApplication);

router.get('/visa/in-progress', ctrl.listVisaInProgress);
router.get('/visa/all', ctrl.listVisaAll);
router.post('/visa/:userId/:step/review', ctrl.reviewVisaDocument);
router.post('/visa/:userId/notify', ctrl.sendNextStepNotification);

module.exports = router;
