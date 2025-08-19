const MESSAGES = {
  AUTH: {
    EMAIL_EXISTS: 'An account with this email already exists',
    INVALID_CREDENTIALS: 'Invalid email or password',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    REGISTRATION_SUCCESS: 'Registration successful',
    UNAUTHORIZED: 'Access denied. Please login first',
    TOKEN_REQUIRED: 'Access token is required',
    INVALID_TOKEN: 'Invalid or expired token',
    TOKEN_EXPIRED: 'Token has expired',
    PASSWORD_CHANGED: 'Password changed successfully',
    INVALID_CURRENT_PASSWORD: 'Current password is incorrect',
    FORBIDDEN: 'Access forbidden',
    ACCESS_DENIED: 'Access denied'
  },
  
  EMPLOYEE: {
    NOT_FOUND: 'Employee not found',
    UPDATED: 'Employee profile updated successfully',
    DELETED: 'Employee deleted successfully',
    ALREADY_EXISTS: 'Employee already exists'
  },
  
  ATTENDANCE: {
    CLOCK_IN_SUCCESS: 'Successfully clocked in',
    CLOCK_OUT_SUCCESS: 'Successfully clocked out',
    ALREADY_CLOCKED_IN: 'Employee is already clocked in',
    NO_ACTIVE_ATTENDANCE: 'No active attendance record found',
    ATTENDANCE_NOT_FOUND: 'Attendance record not found',
    ALREADY_CLOCKED_OUT: 'Attendance record is already clocked out'
  },
  
  MOVEMENT: {
    STARTED: 'Movement tracking started successfully',
    ENDED: 'Movement tracking ended successfully',
    NOT_FOUND: 'Movement record not found',
    ALREADY_ENDED: 'Movement tracking is already ended'
  },
  
  VALIDATION: {
    REQUIRED_FIELDS: 'Please provide all required fields',
    INVALID_EMAIL: 'Please provide a valid email address',
    PASSWORD_TOO_SHORT: 'Password must be at least 6 characters long',
    INVALID_COORDINATES: 'Invalid GPS coordinates provided',
    INVALID_ID: 'Invalid ID format'
  },
  
  GENERAL: {
    SERVER_ERROR: 'Internal server error occurred',
    SUCCESS: 'Operation completed successfully',
    FAILED: 'Operation failed',
    NOT_FOUND: 'Resource not found',
    ACCESS_DENIED: 'Access denied',
    INVALID_REQUEST: 'Invalid request format'
  },
  
  DATABASE: {
    CONNECTION_ERROR: 'Database connection error',
    SAVE_ERROR: 'Failed to save data',
    UPDATE_ERROR: 'Failed to update data',
    DELETE_ERROR: 'Failed to delete data',
    QUERY_ERROR: 'Database query failed'
  }
};

module.exports = {
  MESSAGES
};