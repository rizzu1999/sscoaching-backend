const Teacher = require('../models/Teacher');
const Course = require('../models/Course');

// GET /api/teachers
exports.getTeachers = async (req, res, next) => {
  try {
    const teachers = await Teacher.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, teachers });
  } catch (err) { next(err); }
};

// GET /api/teachers/:id
exports.getTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    const courses = await Course.find({ teacher: teacher._id, isPublished: true }, 'title subject thumbnail rating totalStudents');
    res.json({ success: true, teacher, courses });
  } catch (err) { next(err); }
};

// POST /api/teachers  (admin only)
exports.createTeacher = async (req, res, next) => {
  try {
    const data = req.body;
    if (req.file) data.photo = `/uploads/${req.file.filename}`;
    if (typeof data.subjects === 'string') data.subjects = data.subjects.split(',').map(s => s.trim());
    const teacher = await Teacher.create(data);
    res.status(201).json({ success: true, teacher });
  } catch (err) { next(err); }
};

// PUT /api/teachers/:id  (admin only)
exports.updateTeacher = async (req, res, next) => {
  try {
    const data = req.body;
    if (req.file) data.photo = `/uploads/${req.file.filename}`;
    if (typeof data.subjects === 'string') data.subjects = data.subjects.split(',').map(s => s.trim());
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json({ success: true, teacher });
  } catch (err) { next(err); }
};

// DELETE /api/teachers/:id  (admin only)
exports.deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json({ success: true, message: 'Teacher deleted' });
  } catch (err) { next(err); }
};
