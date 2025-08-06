const AttendanceService = require('../services/attendanceService');
const { ApiResponse, asyncHandler } = require('../utils/response');

class AttendanceController {
  constructor() {
    this.attendanceService = new AttendanceService();
  }

  clockIn = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    const clockInData = { ...req.body, employeeId };
    
    const result = await this.attendanceService.clockIn(clockInData);
    
    res.status(201).json(
      ApiResponse.success(
        result,
        'Successfully clocked in',
        201
      )
    );
  });

  clockOut = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    const clockOutData = { ...req.body, employeeId };
    
    const result = await this.attendanceService.clockOut(clockOutData);
    
    res.json(
      ApiResponse.success(
        result,
        'Successfully clocked out'
      )
    );
  });

  getStatus = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    const status = await this.attendanceService.getCurrentStatus(employeeId);
    
    res.json(
      ApiResponse.success(
        status,
        'Clock status retrieved successfully'
      )
    );
  });

  getHistory = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const result = await this.attendanceService.getAttendanceHistory(
      employeeId,
      { page: parseInt(page), limit: parseInt(limit), startDate, endDate }
    );
    
    res.json(
      ApiResponse.paginated(
        result.records,
        result.total,
        parseInt(page),
        parseInt(limit),
        'Attendance history retrieved successfully'
      )
    );
  });
}

module.exports = AttendanceController;