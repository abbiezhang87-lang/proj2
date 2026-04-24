const router = require('express').Router();
const ctrl = require('../controllers/employeeController');
// const auth = require('../middleware/auth');

// GET    /api/employees/me
// PATCH  /api/employees/me/:section        e.g. name | address | contact | employment | emergency
// GET    /api/employees/me/documents
// GET    /api/employees/me/documents/:id   (download/preview)

router.get('/me', /* auth, */ ctrl.getMyProfile);
router.patch('/me/:section', /* auth, */ ctrl.updateSection);
router.get('/me/documents', /* auth, */ ctrl.listMyDocuments);
router.get('/me/documents/:id', /* auth, */ ctrl.downloadDocument);

module.exports = router;
