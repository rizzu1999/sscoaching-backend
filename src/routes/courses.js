const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/courseController');

router.get('/',    ctrl.getCourses);
router.get('/:id', ctrl.getCourse);

router.post('/',            protect, adminOnly, upload.single('thumbnail'), ctrl.createCourse);
router.put('/:id',          protect, adminOnly, upload.single('thumbnail'), ctrl.updateCourse);
router.delete('/:id',       protect, adminOnly, ctrl.deleteCourse);
router.patch('/:id/publish',protect, adminOnly, ctrl.togglePublish);

router.post('/:id/sections',                        protect, adminOnly, ctrl.addSection);
router.post('/:id/sections/:sectionId/lectures',    protect, adminOnly, ctrl.addLecture);

module.exports = router;
