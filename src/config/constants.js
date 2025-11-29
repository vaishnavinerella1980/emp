// src/config/constants.js
module.exports = {
  // User roles for authorization
  USER_ROLES: {
    EMPLOYEE: 'employee',
    MANAGER: 'manager',
    ADMIN: 'admin'
  },

  // Attendance record status options
  ATTENDANCE_STATUS: {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  // Movement record status options
  MOVEMENT_STATUS: {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  // NEW: Movement types
  MOVEMENT_TYPES: {
    CLOCK_IN_PATH: 'CLOCK_IN_PATH',
    MANUAL_MOVEMENT: 'MANUAL_MOVEMENT'
  },

  // NEW: Office names
  OFFICES: {
    ACS: 'ACS',
    IOTIQ: 'IOTIQ'
  },

  // NEW: Departments
  DEPARTMENTS: {
    IT: 'IT',
    HR: 'HR',
    FINANCE: 'Finance',
    MARKETING: 'Marketing',
    SALES: 'Sales',
    OPERATIONS: 'Operations',
    GENERAL: 'General'
  },

  // Validation rules
  VALIDATION_RULES: {
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_MAX_LENGTH: 128,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
    EMAIL_MAX_LENGTH: 255,
    PHONE_MAX_LENGTH: 20,
    ADDRESS_MAX_LENGTH: 500,
    DEPARTMENT_MAX_LENGTH: 100,
    POSITION_MAX_LENGTH: 100,
    REASON_MAX_LENGTH: 255
  },

  // Pagination default values
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },

  // Location related constants
  LOCATION: {
    MAX_ACCURACY: 100,
    MAX_LOCATION_AGE_MINUTES: 10,
    MAX_LOCATION_RECORDS: 1000,
    EARTH_RADIUS_METERS: 6371000,
    OFFICE_DETECTION_RADIUS: 100 // meters
  },

  // Time related constants
  TIME: {
    // Maximum work hours per day in minutes
    MAX_WORK_HOURS_MINUTES: 16 * 60, // 16 hours
    // Minimum break time between shifts in hours
    MIN_BREAK_HOURS: 8,
    // Default timezone
    DEFAULT_TIMEZONE: 'UTC'
  },

  // HTTP Status codes (commonly used ones)
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500
  },

  // File upload limits
  FILE_UPLOAD: {
    MAX_SIZE_MB: 5,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
    PROFILE_IMAGE_MAX_SIZE_MB: 2
  },

  // Session configuration
  SESSION: {
    DEFAULT_EXPIRES_HOURS: 24,
    REFRESH_TOKEN_EXPIRES_DAYS: 30,
    MAX_SESSIONS_PER_USER: 5
  },

  // Rate limiting constants
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 1000,
    // Stricter limits for auth endpoints
    AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    AUTH_MAX_REQUESTS: 10
  },

  // Database related constants
  DATABASE: {
    // Connection timeout in ms
    CONNECTION_TIMEOUT: 5000,
    // Socket timeout in ms
    SOCKET_TIMEOUT: 45000,
    // Maximum pool size
    MAX_POOL_SIZE: 10
  },

  // Movement tracking constants
  MOVEMENT: {
    // Maximum estimated time for a movement in minutes
    MAX_ESTIMATED_MINUTES: 24 * 60, // 24 hours
    // Default movement reasons
    DEFAULT_REASONS: [
      'Client Meeting',
      'Site Visit',
      'Business Trip',
      'Training',
      'Conference',
      'General Movement'
    ]
  },

  // Geofencing constants
  GEOFENCING: {
    // Default office radius in meters
    DEFAULT_OFFICE_RADIUS: 100,
    // Maximum allowed distance from office in meters
    MAX_OFFICE_DISTANCE: 10000, // 10km
    // GPS accuracy threshold in meters
    GPS_ACCURACY_THRESHOLD: 50
  },

  // API Response types
  RESPONSE_TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  },

  // Sort orders for queries
  SORT_ORDER: {
    ASC: 'asc',
    DESC: 'desc',
    ASCENDING: 1,
    DESCENDING: -1
  },

  // Common sort fields
  SORT_FIELDS: {
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    NAME: 'name',
    EMAIL: 'email',
    LOGIN_TIME: 'login_time',
    TIMESTAMP: 'timestamp'
  },

  // Date formats
  DATE_FORMATS: {
    ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
    DATE_ONLY: 'YYYY-MM-DD',
    TIME_ONLY: 'HH:mm:ss',
    DATETIME: 'YYYY-MM-DD HH:mm:ss'
  },

  // Regular expressions for validation
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[+]?[\d\s\-\(\)]{10,20}$/,
    PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    EMPLOYEE_ID: /^\d{4,}_[a-f\d]{8}$/,
    UUID_SHORT: /^[a-f\d]{8}$/
  },

  // Error types for better error handling
  ERROR_TYPES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
    CONFLICT_ERROR: 'CONFLICT_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR'
  },

  // Logging levels
  LOG_LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  },

  // Environment types
  ENVIRONMENTS: {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
    TEST: 'test',
    STAGING: 'staging'
  },

  // Cache TTL (Time To Live) in seconds
  CACHE_TTL: {
    SHORT: 300,      // 5 minutes
    MEDIUM: 3600,    // 1 hour
    LONG: 86400,     // 24 hours
    VERY_LONG: 604800 // 1 week
  },

  // Device info constants
  DEVICE: {
    MAX_BATTERY_LEVEL: 100,
    MIN_BATTERY_LEVEL: 0,
    LOW_BATTERY_THRESHOLD: 20
  },

  // Security constants
  SECURITY: {
    BCRYPT_ROUNDS: 12,
    JWT_ALGORITHM: 'HS256',
    SESSION_COOKIE_NAME: 'employee_session',
    CSRF_TOKEN_LENGTH: 32
  }
};