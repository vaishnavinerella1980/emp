require('dotenv').config();

module.exports = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:vaishnavi2025@localhost:5432/employee_tracking',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Office Locations
  OFFICE_LATITUDE: parseFloat(process.env.OFFICE_LATITUDE) || 12.9716,
  OFFICE_LONGITUDE: parseFloat(process.env.OFFICE_LONGITUDE) || 77.5946,
  OFFICE_RADIUS: parseFloat(process.env.OFFICE_RADIUS) || 100,
  IOTIQ_LATITUDE: parseFloat(process.env.IOTIQ_LATITUDE) || 17.3850,
  IOTIQ_LONGITUDE: parseFloat(process.env.IOTIQ_LONGITUDE) || 78.4867,
  IOTIQ_RADIUS: parseFloat(process.env.IOTIQ_RADIUS) || 100,
  
  // Rate limiting
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  
  // Email
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Location Tracking
  OFFICE_DETECTION_RADIUS: parseInt(process.env.OFFICE_DETECTION_RADIUS) || 100,
  MAX_LOCATION_UPDATES: parseInt(process.env.MAX_LOCATION_UPDATES_PER_EMPLOYEE) || 1000,
  LOCATION_UPDATE_INTERVAL: parseInt(process.env.LOCATION_UPDATE_INTERVAL_MS) || 300000,
  
  // Application
  API_VERSION: process.env.API_VERSION || 'v1',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  DEBUG_MODE: process.env.DEBUG_MODE === 'true',
  
  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  PASSWORD_MIN_LENGTH: parseInt(process.env.PASSWORD_MIN_LENGTH) || 6
};