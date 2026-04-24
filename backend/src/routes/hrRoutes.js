const router = require('express').Router();
const ctrl = require('../controllers/hrController');
// const auth = require('../middleware/auth');
// const requireHR = require('../middleware/role')('hr');

// All routes below require HR role.
// router.use(auth, requireHR);

// Employee Profiles
router.get('/employees', ctrl.listEmployees);
router.get('/employees/:employeeId', ctrl.getEmployeeProfile);

// Hiring Management — registration tokens
router.post('/tokens', ctrl.generateRegistrationToken);
router.get('/tokens', ctrl.listTokenHistory);

// Hiring Management — onboarding review
router.get('/applications', ctrl.listApplicationsByStatus);      // ?status=pending|approved|rejected
router.post('/applications/:applicationId/review', ctrl.reviewApplication);

// Visa Status Management
router.get('/visa/in-progress', ctrl.listVisaInProgress);
router.get('/visa/all', ctrl.listVisaAll);
router.post('/visa/:userId/:step/review', ctrl.reviewVisaDocument);
router.post('/visa/:userId/notify', ctrl.sendNextStepNotification);

module.exports = router;
