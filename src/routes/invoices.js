const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const ctrl = require('../controllers/invoiceController');

router.get('/my',        protect, ctrl.getMyInvoices);
router.get('/:id',       protect, ctrl.getInvoice);

module.exports = router;
