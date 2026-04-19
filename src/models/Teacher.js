const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  phone:         { type: String },
  bio:           { type: String },
  qualification: { type: String },
  experience:    { type: String },
  subjects:      [{ type: String }],
  photo:         { type: String, default: '' },
  isActive:      { type: Boolean, default: true },
  totalStudents: { type: Number, default: 0 },
  rating:        { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
