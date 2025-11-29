const { ApiResponse, asyncHandler } = require('../utils/response');
const AttendanceService = require('../services/attendanceService');

class TimingReportController {
  constructor() {
    this.attendanceService = new AttendanceService();
  }

  // Get timing reports with filters
  getTimingReports = asyncHandler(async (req, res) => {
    const { 
      employeeId, 
      department, 
      office, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 50 
    } = req.query;

    // If manager, restrict to their department
    let managerDepartment = null;
    if (req.user.role === 'manager') {
      // In real implementation, get manager's department from database
      managerDepartment = req.user.department;
    }

    const result = await this.attendanceService.getTimingReports({
      employeeId,
      department: department || managerDepartment,
      office,
      startDate,
      endDate,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json(
      ApiResponse.paginated(
        result.timingReports,
        result.pagination.total_records,
        parseInt(page),
        parseInt(limit),
        'Timing reports retrieved successfully'
      )
    );
  });

  // Get dashboard stats
  getDashboardStats = asyncHandler(async (req, res) => {
    let managerId = null;
    if (req.user.role === 'manager') {
      managerId = req.user.employeeId;
    }

    const stats = await this.attendanceService.getDashboardStats(managerId);

    res.json(
      ApiResponse.success(
        stats,
        'Dashboard stats retrieved successfully'
      )
    );
  });

  // Get employee movement path
  getMovementPath = asyncHandler(async (req, res) => {
    const { employeeId, date, attendanceId } = req.query;
    const requestingEmployeeId = req.user.employeeId;
    const role = req.user.role;

    // Authorization check
    if (role === 'employee' && employeeId !== requestingEmployeeId) {
      return res.status(403).json(
        ApiResponse.error('Access denied. Employees can only view their own data.')
      );
    }

    // In real implementation, fetch movement data from database
    const movementPath = []; // This would come from movements table

    res.json(
      ApiResponse.success(
        { movementPath },
        'Movement path retrieved successfully'
      )
    );
  });
}

module.exports = TimingReportController;