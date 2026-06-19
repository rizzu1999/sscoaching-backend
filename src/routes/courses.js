const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl   = require('../controllers/courseController');

router.get('/',    ctrl.getCourses);
router.get('/:id', ctrl.getCourse);

router.post('/',   protect, adminOnly, upload.any(), ctrl.createCourse);
router.put('/:id', protect, adminOnly, upload.any(), ctrl.updateCourse);
router.delete('/:id', protect, adminOnly, ctrl.deleteCourse);
router.patch('/:id/publish', protect, adminOnly, ctrl.togglePublish);

// Curriculum — save full chapters array at once
router.put('/:id/curriculum', protect, adminOnly, ctrl.saveCurriculum);

// Chapters
router.post('/:id/chapters',              protect, adminOnly, ctrl.addChapter);
router.put('/:id/chapters/:chapterId',    protect, adminOnly, ctrl.updateChapter);
router.delete('/:id/chapters/:chapterId', protect, adminOnly, ctrl.deleteChapter);

// Lessons
router.post('/:id/chapters/:chapterId/lessons',                       protect, adminOnly, ctrl.addLesson);
router.put('/:id/chapters/:chapterId/lessons/:lessonId',              protect, adminOnly, ctrl.updateLesson);
router.delete('/:id/chapters/:chapterId/lessons/:lessonId',           protect, adminOnly, ctrl.deleteLesson);

module.exports = router;
