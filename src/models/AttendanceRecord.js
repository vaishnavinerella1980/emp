const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
  employee_name: {
    type: String,
    required: true
  },
  clock_in_time: {
    type: String,
    required: true
  },
  clock_out_time: {
    type: String,
    default: null
  },
  clock_in_location: {
    type: String,
    required: true
  },
  clock_out_location: {
    type: String,
    default: null
  },
  clock_in_address: {
    type: String,
    required: true
  },
  clock_out_address: {
    type: String,
    default: null
  },
  total_hours: {
    type: Number,
    default: null
  },
  date: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
    index: true
  },
  is_active: {
    type: Boolean,
    default: true,
    index: true
  },
  created_at: {
    type: String,
    required: true
  },
  updated_at: {
    type: String,
    required: true
  }
});

// Compound indexes for better query performance
attendanceSchema.index({ employee_id: 1, date: -1 });
attendanceSchema.index({ employee_id: 1, is_active: 1 });
attendanceSchema.index({ employee_id: 1, status: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);