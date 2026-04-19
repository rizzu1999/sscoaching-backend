const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/stats',                    ctrl.getStats);
router.get('/students',                 ctrl.getStudents);
router.put('/students/:id/toggle-status', ctrl.toggleStudentStatus);
router.post('/create-admin',            ctrl.createAdmin);

module.exports = router;
