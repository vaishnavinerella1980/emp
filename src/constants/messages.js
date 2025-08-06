const MESSAGES = {
  AUTH: {
    TOKEN_REQUIRED: 'Access token required',
    INVALID_TOKEN: 'Invalid token provided',
    TOKEN_EXPIRED: 'Token has expired',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    ACCESS_DENIED: 'Access denied',
    EMAIL_EXISTS: 'Employee with this email already exists',
    INVALID_CREDENTIALS: 'Invalid email or password',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    REGISTRATION_SUCCESS: 'Employee registered successfully'
  },
  ATTENDANCE: {
    ALREADY_CLOCKED_IN: 'You have already clocked in today',
    NOT_CLOCKED_IN: 'No active clock-in record found for today',
    CLOCK_IN_SUCCESS: 'Successfully clocked in',
    CLOCK_OUT_SUCCESS: 'Successfully clocked out',
    INVALID_LOCATION: 'Invalid location coordinates provided',
    LOCATION_REQUIRED: 'Location coordinates are required'
  },
  MOVEMENT: {
    CREATED_SUCCESS: 'Movement record created successfully',
    UPDATED_SUCCESS: 'Movement record updated successfully',
    NOT_FOUND: 'Movement record not found',
    ALREADY_COMPLETED: 'Movement already completed'
  },
  LOCATION: {
    UPDATE_SUCCESS: 'Location updated successfully',
    VALIDATION_SUCCESS: 'Location validated successfully',
    INVALID_COORDINATES: 'Invalid coordinates provided'
  },
  EMPLOYEE: {
    NOT_FOUND: 'Employee not found',
    UPDATE_SUCCESS: 'Employee profile updated successfully',
    FETCH_SUCCESS: 'Employee data retrieved successfully'
  },
  GENERAL: {
    SUCCESS: 'Operation successful',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation error',
    INTERNAL_ERROR: 'Internal server error'
  }
};

module.exports = { MESSAGES };