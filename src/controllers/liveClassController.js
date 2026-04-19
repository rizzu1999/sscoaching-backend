const LiveClass = require('../models/LiveClass');

// GET /api/live-classes
exports.getLiveClasses = async (req, res, next) => {
  try {
    const { status } = req.query; // status: live | upcoming | completed
    const filter = {};
    if (status === 'live')      filter.isLive = true;
    if (status === 'upcoming')  { filter.isLive = false; filter.isCompleted = false; filter.scheduledAt = { $gte: new Date() }; }
    if (status === 'completed') filter.isCompleted = true;

    const classes = await LiveClass.find(filter)
      .populate('teacher', 'name photo')
      .sort({ scheduledAt: 1 });
    res.json({ success: true, classes });
  } catch (err) { next(err); }
};

// GET /api/live-classes/:id
exports.getLiveClass = async (req, res, next) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id).populate('teacher', 'name photo bio');
    if (!liveClass) return res.status(404).json({ success: false, message: 'Live class not found' });
    res.json({ success: true, liveClass });
  } catch (err) { next(err); }
};

// POST /api/live-classes  (admin only)
exports.createLiveClass = async (req, res, next) => {
  try {
    const liveClass = await LiveClass.create(req.body);
    await liveClass.populate('teacher', 'name photo');
    res.status(201).json({ success: true, liveClass });
  } catch (err) { next(err); }
};

// PUT /api/live-classes/:id  (admin only)
exports.updateLiveClass = async (req, res, next) => {
  try {
    const liveClass = await LiveClass.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('teacher', 'name photo');
    if (!liveClass) return res.status(404).json({ success: false, message: 'Live class not found' });
    res.json({ success: true, liveClass });
  } catch (err) { next(err); }
};

// DELETE /api/live-classes/:id  (admin only)
exports.deleteLiveClass = async (req, res, next) => {
  try {
    const liveClass = await LiveClass.findByIdAndDelete(req.params.id);
    if (!liveClass) return res.status(404).json({ success: false, message: 'Live class not found' });
    res.json({ success: true, message: 'Live class deleted' });
  } catch (err) { next(err); }
};

// PATCH /api/live-classes/:id/go-live  (admin only)
exports.goLive = async (req, res, next) => {
  try {
    const liveClass = await LiveClass.findByIdAndUpdate(
      req.params.id,
      { isLive: true, isCompleted: false },
      { new: true }
    );
    res.json({ success: true, liveClass });
  } catch (err) { next(err); }
};

// PATCH /api/live-classes/:id/end-live  (admin only)
exports.endLive = async (req, res, next) => {
  try {
    const liveClass = await LiveClass.findByIdAndUpdate(
      req.params.id,
      { isLive: false, isCompleted: true, recordingUrl: req.body.recordingUrl || '' },
      { new: true }
    );
    res.json({ success: true, liveClass });
  } catch (err) { next(err); }
};

// POST /api/live-classes/:id/register  (student)
exports.register = async (req, res, next) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);
    if (!liveClass) return res.status(404).json({ success: false, message: 'Live class not found' });
    if (liveClass.registeredStudents.includes(req.user.id))
      return res.status(400).json({ success: false, message: 'Already registered' });
    liveClass.registeredStudents.push(req.user.id);
    await liveClass.save();
    res.json({ success: true, message: 'Registered for live class' });
  } catch (err) { next(err); }
};
