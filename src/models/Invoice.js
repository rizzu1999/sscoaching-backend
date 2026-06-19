const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  enrollment:    { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment' },
  student:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course:        { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  amount:        { type: Number, default: 0 },
  paymentType:   { type: String, enum: ['free', 'cod', 'online'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  billingInfo: {
    name:    { type: String },
    phone:   { type: String },
    email:   { type: String },
    address: { type: String },
    city:    { type: String },
    state:   { type: String },
    pincode: { type: String },
    notes:   { type: String },
  },
  emailSent: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
