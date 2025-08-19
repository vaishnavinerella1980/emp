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
    type: String,
    required: true,
    index: true
  }
});

// Auto-remove expired sessions
sessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Session', sessionSchema);