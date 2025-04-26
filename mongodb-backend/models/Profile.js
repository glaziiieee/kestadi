// models/Profile.js
const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  middleName: String,
  birthdate: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  course: {
    type: String,
    required: true
  },
  yearLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  address: {
    street: String,
    city: String,
    province: String,
    zipCode: String
  },
  contactNumber: String,
  email: {
    type: String,
    required: true
  },
  guardianName: String,
  guardianContact: String,
  enrollmentStatus: {
    type: String,
    enum: ['Enrolled', 'Not Enrolled', 'Leave of Absence', 'Graduated'],
    default: 'Not Enrolled'
  },
  academicStatus: {
    type: String,
    enum: ['Good Standing', 'Probation', 'Suspension', 'Expelled'],
    default: 'Good Standing'
  },
  photoUrl: String,
  qrCodeUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Add full text search index
ProfileSchema.index({
  firstName: 'text',
  lastName: 'text',
  middleName: 'text',
  studentId: 'text',
  email: 'text'
});

module.exports = mongoose.model('Profile', ProfileSchema);