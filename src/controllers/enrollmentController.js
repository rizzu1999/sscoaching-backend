const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const { generateInvoiceNumber } = require('./invoiceController');
const { sendInvoiceEmail } = require('../utils/mailer');

// POST /api/enrollments  — enroll in a course
exports.enroll = async (req, res, next) => {
  try {
    const { courseId, paymentId, paidAmount, billingInfo } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const existing = await Enrollment.findOne({ student: req.user.id, course: courseId });
    if (existing) return res.status(400).json({ success: false, message: 'Already enrolled in this course' });

    const paymentType = course.isFree ? 'free' : (paymentId ? 'online' : 'cod');
    const paymentStatus = course.isFree ? 'free' : (paymentId ? 'completed' : 'pending');

    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: courseId,
      paidAmount: paidAmount || 0,
      paymentId: paymentId || '',
      paymentStatus,
    });

    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { enrolledCourses: courseId } });

    // Generate invoice
    const student = await User.findById(req.user.id);
    const invoiceNumber = await generateInvoiceNumber();
    const amount = course.isFree ? 0 : (paidAmount || course.price);
    const billing = billingInfo || {
      name: student.name,
      phone: student.phone || '',
      email: student.email,
    };

    const invoice = await Invoice.create({
      invoiceNumber,
      enrollment: enrollment._id,
      student: req.user.id,
      course: courseId,
      amount,
      paymentType,
      paymentStatus: course.isFree ? 'paid' : (paymentId ? 'paid' : 'pending'),
      billingInfo: billing,
      emailSent: false,
    });

    // Send invoice email
    const emailTo = billing.email || student.email;
    const sent = await sendInvoiceEmail({
      to: emailTo,
      invoiceNumber,
      studentName: billing.name || student.name,
      courseName: course.title,
      amount,
      paymentType,
      billingInfo: billing,
    });
    if (sent) await Invoice.findByIdAndUpdate(invoice._id, { emailSent: true });

    res.status(201).json({ success: true, enrollment, invoice });
  } catch (err) { next(err); }
};

// GET /api/enrollments/my  — student's enrollments
exports.getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate('course', 'title subject batch featureImage language enrolledCount chapters')
      .sort({ createdAt: -1 });
    res.json({ success: true, enrollments });
  } catch (err) { next(err); }
};

// PUT /api/enrollments/:id/progress  — update progress
exports.updateProgress = async (req, res, next) => {
  try {
    const { lecturesDone, percentage, lastWatched } = req.body;
    const enrollment = await Enrollment.findOneAndUpdate(
      { _id: req.params.id, student: req.user.id },
      {
        'progress.lecturesDone': lecturesDone,
        'progress.percentage': percentage,
        'progress.lastWatched': lastWatched,
        'progress.lastAccessedAt': new Date(),
        ...(percentage >= 100 ? { isCompleted: true, completedAt: new Date() } : {}),
      },
      { new: true }
    );
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    res.json({ success: true, enrollment });
  } catch (err) { next(err); }
};

// POST /api/enrollments/:id/review
exports.addReview = async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    const enrollment = await Enrollment.findOneAndUpdate(
      { _id: req.params.id, student: req.user.id },
      { rating, review },
      { new: true }
    );
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    const allRatings = await Enrollment.find({ course: enrollment.course, rating: { $exists: true } }, 'rating');
    if (allRatings.length > 0) {
      const avg = allRatings.reduce((sum, e) => sum + e.rating, 0) / allRatings.length;
      await Course.findByIdAndUpdate(enrollment.course, { 'rating.average': avg.toFixed(1), 'rating.count': allRatings.length });
    }
    res.json({ success: true, enrollment });
  } catch (err) { next(err); }
};
