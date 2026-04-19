const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const ctrl = require('../controllers/liveClassController');

router.get('/',    ctrl.getLiveClasses);
router.get('/:id', ctrl.getLiveClass);

router.post('/',              protect, adminOnly, ctrl.createLiveClass);
router.put('/:id',            protect, adminOnly, ctrl.updateLiveClass);
router.delete('/:id',         protect, adminOnly, ctrl.deleteLiveClass);
router.patch('/:id/go-live',  protect, adminOnly, ctrl.goLive);
router.patch('/:id/end-live', protect, adminOnly, ctrl.endLive);
router.post('/:id/register',  protect, ctrl.register);

module.exports = router;
