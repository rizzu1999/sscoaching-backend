const Course = require('../models/Course');

// Light field list for course list view — excludes heavy lesson content
const LIST_SELECT = '-chapters.lessons.youtubeLink -chapters.lessons.videoUrl -chapters.lessons.notes';

// In-process cache for the public course list (5-minute TTL)
let _courseCache = null;
let _courseCacheAt = 0;
const CACHE_TTL = 5 * 60 * 1000;

// GET /api/courses
exports.getCourses = async (req, res, next) => {
  try {
    const { subject, batch, isFree, search, page = 1, limit = 20, showAll } = req.query;
    const isAdmin = showAll === 'true';

    if (!isAdmin) {
      // Serve public list from cache (avoids slow repeated MongoDB queries)
      const now = Date.now();
      if (!_courseCache || now - _courseCacheAt > CACHE_TTL) {
        const courses = await Course.find({ status: 'published' })
          .sort({ createdAt: -1 })
          .select(LIST_SELECT)
          .lean();
        _courseCache = courses;
        _courseCacheAt = now;
      }

      // Client-side filter on cached list
      let list = _courseCache;
      if (subject) list = list.filter(c => c.subject === subject);
      if (batch)   list = list.filter(c => c.batch === batch);
      if (isFree === 'true') list = list.filter(c => c.isFree);
      if (search)  {
        const re = new RegExp(search, 'i');
        list = list.filter(c => re.test(c.title));
      }

      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=120');
      return res.json({ success: true, total: list.length, courses: list });
    }

    // Admin: return all courses with full data, no cache
    const filter = {};
    if (subject) filter.subject = subject;
    if (batch)   filter.batch   = batch;
    if (isFree === 'true') filter.isFree = true;
    if (search)  filter.title = { $regex: search, $options: 'i' };
    const total   = await Course.countDocuments(filter);
    const courses = await Course.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, total, page: Number(page), courses });
  } catch (err) { next(err); }
};

// Exported so other controllers can invalidate the list cache
exports.invalidateCourseCache = () => { _courseCache = null; };

// GET /api/courses/:id
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (err) { next(err); }
};

const getUploadedImage = (req) => {
  if (req.file) return `/uploads/${req.file.filename}`;
  if (req.files?.length) return `/uploads/${req.files[0].filename}`;
  return null;
};

// POST /api/courses
exports.createCourse = async (req, res, next) => {
  try {
    const data = { ...req.body };
    const img = getUploadedImage(req);
    if (img) data.featureImage = img;
    data.isFree = Number(data.price) === 0;
    const course = await Course.create(data);
    exports.invalidateCourseCache();
    res.status(201).json({ success: true, course });
  } catch (err) { next(err); }
};

// PUT /api/courses/:id
exports.updateCourse = async (req, res, next) => {
  try {
    const data = { ...req.body };
    const img = getUploadedImage(req);
    if (img) data.featureImage = img;
    if (data.price !== undefined) data.isFree = Number(data.price) === 0;
    const course = await Course.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: false });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    exports.invalidateCourseCache();
    res.json({ success: true, course });
  } catch (err) { next(err); }
};

// DELETE /api/courses/:id
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course deleted' });
  } catch (err) { next(err); }
};

// PATCH /api/courses/:id/publish
exports.togglePublish = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    course.status = course.status === 'published' ? 'draft' : 'published';
    await course.save();
    res.json({ success: true, status: course.status, course });
  } catch (err) { next(err); }
};

// PUT /api/courses/:id/curriculum — save full curriculum at once
exports.saveCurriculum = async (req, res, next) => {
  try {
    const { chapters } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: { chapters } },
      { new: true }
    );
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (err) { next(err); }
};

// POST /api/courses/:id/chapters
exports.addChapter = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    course.chapters.push({ title: req.body.title, order: course.chapters.length });
    await course.save();
    res.json({ success: true, course });
  } catch (err) { next(err); }
};

// PUT /api/courses/:id/chapters/:chapterId
exports.updateChapter = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    const chapter = course?.chapters.id(req.params.chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });
    chapter.title = req.body.title ?? chapter.title;
    await course.save();
    res.json({ success: true, course });
  } catch (err) { next(err); }
};

// DELETE /api/courses/:id/chapters/:chapterId
exports.deleteChapter = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    course.chapters.pull({ _id: req.params.chapterId });
    await course.save();
    res.json({ success: true, course });
  } catch (err) { next(err); }
};

// POST /api/courses/:id/chapters/:chapterId/lessons
exports.addLesson = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    const chapter = course?.chapters.id(req.params.chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });
    chapter.lessons.push({ ...req.body, order: chapter.lessons.length });
    await course.save();
    res.json({ success: true, course });
  } catch (err) { next(err); }
};

// PUT /api/courses/:id/chapters/:chapterId/lessons/:lessonId
exports.updateLesson = async (req, res, next) => {
  try {
    const course  = await Course.findById(req.params.id);
    const chapter = course?.chapters.id(req.params.chapterId);
    const lesson  = chapter?.lessons.id(req.params.lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    Object.assign(lesson, req.body);
    await course.save();
    res.json({ success: true, course });
  } catch (err) { next(err); }
};

// DELETE /api/courses/:id/chapters/:chapterId/lessons/:lessonId
exports.deleteLesson = async (req, res, next) => {
  try {
    const course  = await Course.findById(req.params.id);
    const chapter = course?.chapters.id(req.params.chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });
    chapter.lessons.pull({ _id: req.params.lessonId });
    await course.save();
    res.json({ success: true, course });
  } catch (err) { next(err); }
};
