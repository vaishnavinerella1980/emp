const express = require('express');
const AttendanceController = require('../controllers/attendanceController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');
const { asyncHandler } = require('../utils/response');

const router = express.Router();
const attendanceController = new AttendanceController();

// All attendance routes require authentication
router.use(AuthMiddleware.authenticate);

// Clock in
router.post('/clock-in',
  ValidationMiddleware.validateClockIn,
  asyncHandler(attendanceController.clockIn)
);

// Clock out
router.post('/clock-out',
  ValidationMiddleware.validateClockOut,
  asyncHandler(attendanceController.clockOut)
);

// Clock out without attendance ID (auto-find active)
router.post('/clock-out/auto',
  ValidationMiddleware.validateAutoClockOut,
  asyncHandler(attendanceController.autoClockOut)
);

// Force clock out (admin)
router.put('/:attendanceId/force-clock-out',
  asyncHandler(attendanceController.forceClockOut)
);

// End shift (alias for clock-out)
router.post('/end-shift',
  ValidationMiddleware.validateClockOut,
  asyncHandler(attendanceController.clockOut)
);

// Get current attendance for an employee
router.get('/current/:employeeId',
  asyncHandler(attendanceController.getCurrentAttendance)
);

// Get attendance history for an employee
router.get('/history/:employeeId',
  asyncHandler(attendanceController.getAttendanceHistory)
);

// Get clock status for authenticated user
router.get('/status',
  asyncHandler(attendanceController.getClockStatus)
);

module.exports = router;