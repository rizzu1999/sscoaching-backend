const Invoice = require('../models/Invoice');
const Enrollment = require('../models/Enrollment');

async function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const last = await Invoice.findOne({ invoiceNumber: new RegExp(`^SS-${year}-`) }).sort({ createdAt: -1 });
  const seq = last ? parseInt(last.invoiceNumber.split('-')[2]) + 1 : 1;
  return `SS-${year}-${String(seq).padStart(4, '0')}`;
}

// GET /api/invoices/my
exports.getMyInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ student: req.user.id })
      .populate('course', 'title subject batch featureImage')
      .sort({ createdAt: -1 });
    res.json({ success: true, invoices });
  } catch (err) { next(err); }
};

// GET /api/invoices/:id
exports.getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('student', 'name email phone class')
      .populate('course', 'title subject batch');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, invoice });
  } catch (err) { next(err); }
};

// GET /api/admin/invoices — admin: all invoices
exports.adminGetInvoices = async (req, res, next) => {
  try {
    const { search, status, from, to, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.paymentStatus = status;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to)   filter.createdAt.$lte = new Date(new Date(to).setHours(23, 59, 59));
    }

    let invoices = await Invoice.find(filter)
      .populate('student', 'name email phone class')
      .populate('course', 'title subject batch')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    if (search) {
      const s = search.toLowerCase();
      invoices = invoices.filter(i =>
        i.invoiceNumber?.toLowerCase().includes(s) ||
        i.student?.name?.toLowerCase().includes(s) ||
        i.student?.email?.toLowerCase().includes(s) ||
        i.student?.phone?.includes(s) ||
        i.course?.title?.toLowerCase().includes(s)
      );
    }

    const total = await Invoice.countDocuments(filter);
    const totalRevenue = await Invoice.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const paid = await Invoice.countDocuments({ paymentStatus: 'paid' });
    const pending = await Invoice.countDocuments({ paymentStatus: 'pending' });
    const refunded = await Invoice.countDocuments({ paymentStatus: 'refunded' });

    res.json({
      success: true,
      invoices,
      total,
      stats: {
        total,
        paid,
        pending,
        refunded,
        revenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (err) { next(err); }
};

// PATCH /api/admin/invoices/:id/mark-paid
exports.markPaid = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { paymentStatus: 'paid' }, { new: true });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    await Enrollment.findByIdAndUpdate(invoice.enrollment, { paymentStatus: 'completed', paidAmount: invoice.amount });
    res.json({ success: true, invoice });
  } catch (err) { next(err); }
};

// PATCH /api/admin/invoices/:id/mark-refunded
exports.markRefunded = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { paymentStatus: 'refunded' }, { new: true });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, invoice });
  } catch (err) { next(err); }
};

module.exports.generateInvoiceNumber = generateInvoiceNumber;
