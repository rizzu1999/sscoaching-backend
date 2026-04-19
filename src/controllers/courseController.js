const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// GET /api/courses
exports.getCourses = async (req, res, next) => {
  try {
    const { subject, class: cls, isFree, search, page = 1, limit = 12, showAll } = req.query;
    const filter = showAll === 'true' ? {} : { isPublished: true };

    if (subject)        filter.subject = subject;
    if (cls)            filter.class = cls;
    if (isFree === 'true') filter.isFree = true;
    if (search)         filter.title = { $regex: search, $options: 'i' };

    const total = await Course.countDocuments(filter);
    const courses = await Course.find(filter)
      .populate('teacher', 'name photo qualification')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), courses });
  } catch (err) { next(err); }
};

// GET /api/courses/:id
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacher', 'name photo bio qualification experience');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (err) { next(err); }
};

// POST /api/courses  (admin only)
exports.createCourse = async (req, res, next) => {
  try {
    const data = req.body;
    if (req.file) data.thumbnail = `/uploads/${req.file.filename}`;
    data.isFree = data.price === 0 || data.price === '0';

    const course = await Course.create(data);
    await course.populate('teacher', 'name photo');
    res.status(201).json({ success: true, course });
  } catch (err) { next(err); }
};

// PUT /api/courses/:id  (admin only)
exports.updateCourse = async (req, res, next) => {
  try {
    const data = req.body;
    if (req.file) data.thumbnail = `/uploads/${req.file.filename}`;
    if (data.price !== undefined) data.isFree = Number(data.price) === 0;

    const course = await Course.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
      .populate('teacher', 'name photo');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (err) { next(err); }
};

// DELETE /api/courses/:id  (admin only)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) { next(err); }
};

// PATCH /api/courses/:id/publish  (admin only)
exports.togglePublish = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    course.isPublished = !course.isPublished;
    await course.save();
    res.json({ success: true, isPublished: course.isPublished, course });
  } catch (err) { next(err); }
};

// POST /api/courses/:id/sections  (admin only) — add curriculum section
exports.addSection = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    course.curriculum.push({ title: req.body.title, order: course.curriculum.length });
    await course.save();
    res.json({ success: true, course });
  } catch (err) { next(err); }
};

// POST /api/courses/:id/sections/:sectionId/lectures  (admin only)
exports.addLecture = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    const section = course.curriculum.id(req.params.sectionId);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    section.lectures.push({ ...req.body, order: section.lectures.length });
    course.totalLectures = course.curriculum.reduce((acc, s) => acc + s.lectures.length, 0);
    await course.save();
    res.json({ success: true, course });
  } catch (err) { next(err); }
};
