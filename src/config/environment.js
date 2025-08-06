require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/employee-tracking',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Office Location (for geofencing)
  OFFICE_LATITUDE: parseFloat(process.env.OFFICE_LATITUDE) || 0,
  OFFICE_LONGITUDE: parseFloat(process.env.OFFICE_LONGITUDE) || 0,
  OFFICE_RADIUS: parseFloat(process.env.OFFICE_RADIUS) || 1000,
  
  // Rate limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 1000
};