const mongoose = require('mongoose');

const movementRecordSchema = new mongoose.Schema({
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
  timestamp: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    default: 'General Movement'
  },
  estimated_minutes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  address: {
    type: String,
    required: false,
    default: ''
  },
  return_time: {
    type: String,
    default: null
  },
  actual_duration_minutes: {
    type: Number,
    default: 0
  }
});

// Index for efficient queries
movementRecordSchema.index({ employee_id: 1, timestamp: -1 });

module.exports = mongoose.model('MovementRecord', movementRecordSchema);