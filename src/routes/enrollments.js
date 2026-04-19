const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/enrollmentController');

router.post('/',                    protect, ctrl.enroll);
router.get('/my',                   protect, ctrl.getMyEnrollments);
router.put('/:id/progress',         protect, ctrl.updateProgress);
router.post('/:id/review',          protect, ctrl.addReview);

module.exports = router;
