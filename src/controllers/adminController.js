const User = require('../models/User');
const Course = require('../models/Course');
const Teacher = require('../models/Teacher');
const LiveClass = require('../models/LiveClass');
const Enrollment = require('../models/Enrollment');

// GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [totalStudents, totalCourses, totalTeachers, totalLiveClasses, totalEnrollments] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments(),
      Teacher.countDocuments({ isActive: true }),
      LiveClass.countDocuments(),
      Enrollment.countDocuments(),
    ]);

    const publishedCourses = await Course.countDocuments({ isPublished: true });
    const freeCourses = await Course.countDocuments({ isFree: true });
    const liveNow = await LiveClass.countDocuments({ isLive: true });

    const recentStudents = await User.find({ role: 'student' })
      .sort({ createdAt: -1 }).limit(5).select('name email class createdAt');

    const popularCourses = await Course.find({ isPublished: true })
      .sort({ totalStudents: -1 }).limit(5).select('title subject totalStudents rating thumbnail')
      .populate('teacher', 'name');

    res.json({
      success: true,
      stats: { totalStudents, totalCourses, publishedCourses, freeCourses, totalTeachers, totalLiveClasses, liveNow, totalEnrollments },
      recentStudents,
      popularCourses,
    });
  } catch (err) { next(err); }
};

// GET /api/admin/students
exports.getStudents = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = { role: 'student' };
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const total = await User.countDocuments(filter);
    const students = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-password');
    res.json({ success: true, total, students });
  } catch (err) { next(err); }
};

// PUT /api/admin/students/:id/toggle-status
exports.toggleStudentStatus = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    student.isActive = !student.isActive;
    await student.save();
    res.json({ success: true, isActive: student.isActive });
  } catch (err) { next(err); }
};

// POST /api/admin/create-admin — create admin user
exports.createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already exists' });
    const admin = await User.create({ name, email, password, role: 'admin' });
    res.status(201).json({ success: true, admin });
  } catch (err) { next(err); }
};
