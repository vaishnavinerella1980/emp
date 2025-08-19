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
    const { latitude, longitude, reason, estimatedMinutes, address } = req.body;

    // Employee ID comes from authenticated user, not request body
    // No need to validate employeeId from body

    if (!reason || reason.trim().length === 0) {
      throw new ApiError(400, 'Reason is required');
    }

    if (!estimatedMinutes || estimatedMinutes < 1) {
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
    const { id } = req.params;

    // Check if ID is provided
    if (!id) {
      throw new ApiError(400, 'Employee ID is required');
    }

    // Check if ID is a valid number (assuming numeric IDs)
    const employeeId = parseInt(id, 10);
    if (isNaN(employeeId) || employeeId < 1) {
      throw new ApiError(400, 'Employee ID must be a valid positive number');
    }

    // Add parsed ID to request for use in controller
    req.params.id = employeeId;
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
}

module.exports = ValidationMiddleware;