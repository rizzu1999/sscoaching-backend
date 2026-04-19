const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/authController');

router.post('/register',
  [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 })],
  ctrl.register
);
router.post('/login',
  [body('email').isEmail(), body('password').notEmpty()],
  ctrl.login
);
router.post('/admin-login', ctrl.adminLogin);
router.get('/me', protect, ctrl.getMe);
router.put('/update-profile', protect, ctrl.updateProfile);
router.put('/change-password', protect, ctrl.changePassword);

module.exports = router;
