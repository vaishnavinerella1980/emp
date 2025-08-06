const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  employee_id: {
    type: String,
    required: true,
    index: true
  },
  login_time: {
    type: String,
    required: true
  },
  logout_time: {
    type: String,
    default: null
  },
  login_latitude: {
    type: Number,
    required: true
  },
  login_longitude: {
    type: Number,
    required: true
  },
  logout_latitude: {
    type: Number,
    default: null
  },
  logout_longitude: {
    type: Number,
    default: null
  },
  login_address: {
    type: String,
    default: ''
  },
  logout_address: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  reason: {
    type: String,
    default: 'Regular Work'
  },
  work_duration_minutes: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
attendanceRecordSchema.index({ employee_id: 1, login_time: -1 });

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);