const { ApiError } = require('./errorHandler');

class ValidationMiddleware {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password) {
    // At least 6 characters
    return password && password.length >= 6;
  }

  static validateRegistration(req, res, next) {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email, and password are required');
    }

    // Validate name
    if (name.trim().length < 2) {
      throw new ApiError(400, 'Name must be at least 2 characters long');
    }

    // Validate email
    if (!ValidationMiddleware.validateEmail(email)) {
      throw new ApiError(400, 'Please provide a valid email address');
    }

    // Validate password
    if (!ValidationMiddleware.validatePassword(password)) {
      throw new ApiError(400, 'Password must be at least 6 characters long');
    }

    next();
  }

  static validateLogin(req, res, next) {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    // Validate email
    if (!ValidationMiddleware.validateEmail(email)) {
      throw new ApiError(400, 'Please provide a valid email address');
    }

    next();
  }

  static validateClockIn(req, res, next) {
    const { latitude, longitude, address } = req.body;

    // Employee ID comes from authenticated user, not request body
    // No need to validate employeeId from body

    if (latitude === undefined || latitude === null) {
      throw new ApiError(400, 'Latitude is required');
    }

    if (longitude === undefined || longitude === null) {
      throw new ApiError(400, 'Longitude is required');
    }

    if (!address || address.trim().length === 0) {
      throw new ApiError(400, 'Address is required');
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90) {
      throw new ApiError(400, 'Latitude must be between -90 and 90');
    }

    if (longitude < -180 || longitude > 180) {
      throw new ApiError(400, 'Longitude must be between -180 and 180');
    }

    next();
  }

  static validateClockOut(req, res, next) {
    const { attendanceId, latitude, longitude, address } = req.body;

    // Check required fields
    if (!attendanceId) {
      throw new ApiError(400, 'Attendance ID is required');
    }

    if (latitude === undefined || latitude === null) {
      throw new ApiError(400, 'Latitude is required');
    }

    if (longitude === undefined || longitude === null) {
      throw new ApiError(400, 'Longitude is required');
    }

    if (!address || address.trim().length === 0) {
      throw new ApiError(400, 'Address is required');
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90) {
      throw new ApiError(400, 'Latitude must be between -90 and 90');
    }

    if (longitude < -180 || longitude > 180) {
      throw new ApiError(400, 'Longitude must be between -180 and 180');
    }

    next();
  }

  static validateUpdateEmployee(req, res, next) {
    const allowedFields = [
      'name', 'phone', 'department', 'position', 
      'address', 'emergency_contact', 'profile_image'
    ];
    
    const updateData = {};
    let hasValidUpdates = false;

    // Only allow specific fields to be updated
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
        hasValidUpdates = true;
      }
    }

    if (!hasValidUpdates) {
      throw new ApiError(400, 'No valid fields provided for update');
    }

    // Validate name if provided
    if (updateData.name && updateData.name.trim().length < 2) {
      throw new ApiError(400, 'Name must be at least 2 characters long');
    }

    // Add the cleaned update data to request
    req.validatedData = updateData;
    next();
  }

  static validateChangePassword(req, res, next) {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'Current password and new password are required');
    }

    if (!ValidationMiddleware.validatePassword(newPassword)) {
      throw new ApiError(400, 'New password must be at least 6 characters long');
    }

    if (currentPassword === newPassword) {
      throw new ApiError(400, 'New password must be different from current password');
    }

    next();
  }

  static validateMovement(req, res, next) {
    const { latitude, longitude, reason, estimated_minutes, address } = req.body;

    // Employee ID comes from authenticated user, not request body
    // No need to validate employeeId from body

    if (!reason || reason.trim().length === 0) {
      throw new ApiError(400, 'Reason is required');
    }

    if (!estimated_minutes || estimated_minutes < 1) {
      throw new ApiError(400, 'Estimated minutes must be at least 1');
    }

    if (latitude === undefined || latitude === null) {
      throw new ApiError(400, 'Latitude is required');
    }

    if (longitude === undefined || longitude === null) {
      throw new ApiError(400, 'Longitude is required');
    }

    if (!address || address.trim().length === 0) {
      throw new ApiError(400, 'Address is required');
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90) {
      throw new ApiError(400, 'Latitude must be between -90 and 90');
    }

    if (longitude < -180 || longitude > 180) {
      throw new ApiError(400, 'Longitude must be between -180 and 180');
    }

    next();
  }
  static validateMovementCompletion(req, res, next) {
    const { return_time: returnTime, status } = req.body;

    if (!returnTime) {
      throw new ApiError(400, 'Return time is required');
    }

    const dateValue = new Date(returnTime);
    if (Number.isNaN(dateValue.getTime())) {
      throw new ApiError(400, 'Return time must be a valid ISO timestamp');
    }

    if (status && !['completed', 'cancelled'].includes(status)) {
      throw new ApiError(400, 'Status must be either completed or cancelled');
    }

    next();
  }

  static validatePagination(req, res, next) {
    const { page, limit } = req.query;

    // Set default values if not provided
    req.query.page = page ? parseInt(page, 10) : 1;
    req.query.limit = limit ? parseInt(limit, 10) : 10;

    // Validate page number
    if (req.query.page < 1) {
      throw new ApiError(400, 'Page number must be greater than 0');
    }

    // Validate limit
    if (req.query.limit < 1 || req.query.limit > 100) {
      throw new ApiError(400, 'Limit must be between 1 and 100');
    }

    next();
  }

  static validateEmployeeId(req, res, next) {
    let { id } = req.params;

    // Map special alias 'me' to the authenticated user's ID
    if (id === 'me') {
      if (!req.user?.employeeId) {
        throw new ApiError(401, 'Access denied');
      }
      req.params.id = req.user.employeeId;
      return next();
    }

    // Check if ID is provided and is a non-empty string
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new ApiError(400, 'Employee ID is required');
    }

    req.params.id = id.trim();
    next();
  }

  static validateLocation(req, res, next) {
    const { latitude, longitude, address } = req.body;

    // Check required fields
    if (latitude === undefined || latitude === null) {
      throw new ApiError(400, 'Latitude is required');
    }

    if (longitude === undefined || longitude === null) {
      throw new ApiError(400, 'Longitude is required');
    }

    if (!address || address.trim().length === 0) {
      throw new ApiError(400, 'Address is required');
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90) {
      throw new ApiError(400, 'Latitude must be between -90 and 90');
    }

    if (longitude < -180 || longitude > 180) {
      throw new ApiError(400, 'Longitude must be between -180 and 180');
    }

    next();
  }

  static validateAutoClockOut(req, res, next) {
    const { latitude, longitude, address } = req.body;

    // For auto clock out, we don't need attendanceId as it will be auto-detected
    if (latitude === undefined || latitude === null) {
      throw new ApiError(400, 'Latitude is required');
    }

    if (longitude === undefined || longitude === null) {
      throw new ApiError(400, 'Longitude is required');
    }

    if (!address || address.trim().length === 0) {
      throw new ApiError(400, 'Address is required');
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90) {
      throw new ApiError(400, 'Latitude must be between -90 and 90');
    }

    if (longitude < -180 || longitude > 180) {
      throw new ApiError(400, 'Longitude must be between -180 and 180');
    }

    next();
  }

  static validateForgotPassword(req, res, next) {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, 'Email is required');
    }

    if (!ValidationMiddleware.validateEmail(email)) {
      throw new ApiError(400, 'Please provide a valid email address');
    }

    next();
  }

  static validateResetPassword(req, res, next) {
    const { token, newPassword } = req.body;

    if (!token) {
      throw new ApiError(400, 'Reset token is required');
    }

    if (!newPassword) {
      throw new ApiError(400, 'New password is required');
    }

    if (!ValidationMiddleware.validatePassword(newPassword)) {
      throw new ApiError(400, 'New password must be at least 6 characters long');
    }

    next();
  }
}

module.exports = ValidationMiddleware;
