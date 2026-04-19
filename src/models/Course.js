const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  videoUrl: { type: String, default: '' },
  duration: { type: String, default: '0:00' },
  isFree:   { type: Boolean, default: false },
  order:    { type: Number, default: 0 },
});

const sectionSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  order:    { type: Number, default: 0 },
  lectures: [lectureSchema],
});

const courseSchema = new mongoose.Schema({
  title:         { type: String, required: true, trim: true },
  description:   { type: String, required: true },
  subject:       { type: String, required: true, enum: ['Physics', 'Chemistry', 'Maths', 'Biology', 'English', 'Hindi', 'Social Science', 'Other'] },
  class:         { type: String, required: true, enum: ['Class 9', 'Class 10', 'Class 11', 'Class 12', 'JEE', 'NEET', 'Other'] },
  teacher:       { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  price:         { type: Number, default: 0 },
  originalPrice: { type: Number, default: 0 },
  isFree:        { type: Boolean, default: false },
  isPublished:   { type: Boolean, default: false },
  thumbnail:     { type: String, default: '' },
  language:      { type: String, default: 'Hindi' },
  tags:          [{ type: String }],
  whatYouLearn:  [{ type: String }],
  requirements:  [{ type: String }],
  curriculum:    [sectionSchema],
  totalLectures: { type: Number, default: 0 },
  totalDuration: { type: String, default: '0h' },
  totalStudents: { type: Number, default: 0 },
  rating: {
    average: { type: Number, default: 0 },
    count:   { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
