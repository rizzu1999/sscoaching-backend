const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/teacherController');

router.get('/',    ctrl.getTeachers);
router.get('/:id', ctrl.getTeacher);

router.post('/',   protect, adminOnly, upload.single('photo'), ctrl.createTeacher);
router.put('/:id', protect, adminOnly, upload.single('photo'), ctrl.updateTeacher);
router.delete('/:id', protect, adminOnly, ctrl.deleteTeacher);

module.exports = router;
