const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  driveLink: { type: String, default: '' },
  type:      { type: String, enum: ['pdf', 'doc', 'ppt', 'link', 'other'], default: 'pdf' },
}, { _id: true });

const LessonSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  youtubeLink: { type: String, default: '' },
  videoUrl:    { type: String, default: '' },
  videoType:   { type: String, enum: ['youtube', 'upload', 'none'], default: 'youtube' },
  duration:    { type: String, default: '' },
  isFree:      { type: Boolean, default: false },
  order:       { type: Number, default: 0 },
  notes:       [NoteSchema],
}, { _id: true });

const ChapterSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  order:   { type: Number, default: 0 },
  lessons: [LessonSchema],
}, { _id: true });

const courseSchema = new mongoose.Schema({
  title:            { type: String, required: true, trim: true },
  description:      { type: String, default: '' },
  subject:          { type: String, default: '' },
  batch:            { type: String, required: true },
  price:            { type: Number, default: 0 },
  originalPrice:    { type: Number, default: 0 },
  isFree:           { type: Boolean, default: false },
  status:           { type: String, enum: ['draft', 'published'], default: 'draft' },
  featureImage:     { type: String, default: '' },
  language:         { type: String, default: 'Hindi' },
  enrolledCount:    { type: Number, default: 0 },
  courseType:       { type: String, enum: ['subject', 'bundle'], default: 'subject' },
  bundledSubjects:  { type: [String], default: [] },
  chapters:         [ChapterSchema],
  rating: {
    average: { type: Number, default: 0 },
    count:   { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
