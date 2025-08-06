const mongoose = require('mongoose');

const locationUpdateSchema = new mongoose.Schema({
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
  accuracy: {
    type: Number,
    default: null
  },
  heading: {
    type: Number,
    default: null
  },
  speed: {
    type: Number,
    default: null
  },
  address: {
    type: String,
    default: ''
  },
  battery_level: {
    type: Number,
    default: null
  },
  is_mock_location: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('LocationUpdate', locationUpdateSchema);
