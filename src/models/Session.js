const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  employee_id: {
    type: String,
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  created_at: {
    type: String,
    required: true
  },
  expires_at: {
    type: Date,
    default: Date.now,
    expires: 86400 // 24 hours
  }
});

module.exports = mongoose.model('Session', sessionSchema);