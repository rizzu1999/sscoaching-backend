const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  description:  { type: String, default: '' },
  subject:      { type: String, required: true },
  class:        { type: String, required: true },
  teacher:      { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  scheduledAt:  { type: Date, required: true },
  duration:     { type: Number, default: 60, comment: 'in minutes' },
  meetingLink:  { type: String, default: '' },
  isLive:       { type: Boolean, default: false },
  isCompleted:  { type: Boolean, default: false },
  viewers:      { type: Number, default: 0 },
  recordingUrl: { type: String, default: '' },
  thumbnail:    { type: String, default: '' },
  isFree:       { type: Boolean, default: true },
  registeredStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('LiveClass', liveClassSchema);
