const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');
const invoiceCtrl = require('../controllers/invoiceController');

router.use(protect, adminOnly);

router.get('/stats',                       ctrl.getStats);
router.get('/students',                    ctrl.getStudents);
router.put('/students/:id/toggle-status',  ctrl.toggleStudentStatus);
router.post('/create-admin',               ctrl.createAdmin);

// Enrollments
router.get('/enrollments',                 ctrl.getEnrollments);

// Invoices
router.get('/invoices',                    invoiceCtrl.adminGetInvoices);
router.patch('/invoices/:id/mark-paid',    invoiceCtrl.markPaid);
router.patch('/invoices/:id/mark-refunded',invoiceCtrl.markRefunded);

module.exports = router;
