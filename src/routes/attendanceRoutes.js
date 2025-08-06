const express = require('express');
const AttendanceController = require('../controllers/attendenceController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();
const attendanceController = new AttendanceController();

// Apply authentication to all routes
router.use(AuthMiddleware.authenticate);

// Clock operations
router.post('/clock-in',
  ValidationMiddleware.validateLocation,
  attendanceController.clockIn
);

router.post('/clock-out',
  ValidationMiddleware.validateLocation,
  attendanceController.clockOut
);

// Status and history
router.get('/status', attendanceController.getStatus);

router.get('/history',
  ValidationMiddleware.validatePagination,
  attendanceController.getHistory
);

module.exports = router;