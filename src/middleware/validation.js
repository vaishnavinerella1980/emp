const { body, param, query, validationResult } = require('express-validator');
const { ApiError } = require('./errorHandler');
const { VALIDATION_RULES } = require('../config/constants');

class ValidationMiddleware {
  static handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return next(new ApiError(400, errorMessages.join(', ')));
    }
    next();
  };

  static validateRegistration = [
    body('name')
      .trim()
      .isLength({ min: VALIDATION_RULES.NAME_MIN_LENGTH, max: VALIDATION_RULES.NAME_MAX_LENGTH })
      .withMessage(`Name must be between ${VALIDATION_RULES.NAME_MIN_LENGTH}-${VALIDATION_RULES.NAME_MAX_LENGTH} characters`),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: VALIDATION_RULES.PASSWORD_MIN_LENGTH })
      .withMessage(`Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`),
    body('confirm_password')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
    this.handleValidationErrors
  ];

  static validateLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    this.handleValidationErrors
  ];

  static validateLocation = [
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    this.handleValidationErrors
  ];

  static validateEmployeeId = [
    param('employeeId').notEmpty().withMessage('Employee ID is required'),
    this.handleValidationErrors
  ];

  static validateMovement = [
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    body('reason').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Reason must be 1-255 characters'),
    body('estimated_minutes').optional().isInt({ min: 0, max: 1440 }).withMessage('Estimated minutes must be 0-1440'),
    this.handleValidationErrors
  ];

  static validatePagination = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
    this.handleValidationErrors
  ];
}

module.exports = ValidationMiddleware;