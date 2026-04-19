const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  paidAmount:  { type: Number, default: 0 },
  paymentId:   { type: String, default: '' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'free'], default: 'free' },
  progress: {
    lecturesDone:  { type: Number, default: 0 },
    percentage:    { type: Number, default: 0 },
    lastWatched:   { type: String, default: '' },
    lastAccessedAt:{ type: Date },
  },
  isCompleted:  { type: Boolean, default: false },
  completedAt:  { type: Date },
  rating:       { type: Number, min: 1, max: 5 },
  review:       { type: String },
}, { timestamps: true });

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
