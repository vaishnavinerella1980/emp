const { ApiResponse, asyncHandler } = require('../utils/response');
const AttendanceService = require('../services/attendanceService');

class AttendanceController {
  constructor() {
    this.attendanceService = new AttendanceService();
    
    // Bind methods to ensure proper 'this' context
    this.clockIn = this.clockIn.bind(this);
    this.clockOut = this.clockOut.bind(this);
    this.getCurrentAttendance = this.getCurrentAttendance.bind(this);
    this.getAttendanceHistory = this.getAttendanceHistory.bind(this);
    this.getClockStatus = this.getClockStatus.bind(this);
  }

  async clockIn(req, res) {
    try {
      const { latitude, longitude, address } = req.body;
      const employeeId = req.user.employeeId; // Get from authenticated user

      console.log('=== CLOCK IN CONTROLLER DEBUG ===');
      console.log('Employee ID from auth:', employeeId);
      console.log('Location:', { latitude, longitude, address });

      const result = await this.attendanceService.clockIn({
        employeeId,
        latitude,
        longitude,
        address
      });

      console.log('Clock in result:', result);

      // Check if already clocked in
      if (result.alreadyClockedIn) {
        res.status(200).json(
          ApiResponse.success(
            { 
              attendance: result.attendance,
              message: result.message,
              alreadyClockedIn: true
            },
            result.message,
            200
          )
        );
      } else {
        res.status(201).json(
          ApiResponse.success(
            { 
              attendance: result,
              message: 'Successfully clocked in'
            },
            'Clock in successful',
            201
          )
        );
      }
    } catch (error) {
      console.error('Clock in controller error:', error);
      throw error;
    }
  }

  async clockOut(req, res) {
    try {
      const { attendanceId, latitude, longitude, address } = req.body;

      console.log('=== CLOCK OUT CONTROLLER DEBUG ===');
      console.log('Attendance ID:', attendanceId);
      console.log('Location:', { latitude, longitude, address });

      const attendance = await this.attendanceService.clockOut({
        attendanceId,
        latitude,
        longitude,
        address
      });

      console.log('Clock out successful:', attendance);

      res.json(
        ApiResponse.success(
          { 
            attendance,
            message: 'Successfully clocked out'
          },
          'Clock out successful'
        )
      );
    } catch (error) {
      console.error('Clock out controller error:', error);
      throw error;
    }
  }

  async getCurrentAttendance(req, res) {
    try {
      const { employeeId } = req.params;

      console.log('=== GET CURRENT ATTENDANCE DEBUG ===');
      console.log('Employee ID:', employeeId);

      const attendance = await this.attendanceService.getCurrentAttendance(employeeId);

      console.log('Current attendance:', attendance);

      if (attendance) {
        res.json(
          ApiResponse.success(
            { 
              attendance,
              message: 'Current attendance retrieved'
            },
            'Current attendance found'
          )
        );
      } else {
        res.json(
          ApiResponse.success(
            { 
              attendance: null,
              message: 'No active attendance found'
            },
            'No active attendance'
          )
        );
      }
    } catch (error) {
      console.error('Get current attendance controller error:', error);
      throw error;
    }
  }

  async getAttendanceHistory(req, res) {
    try {
      const { employeeId } = req.params;
      const { startDate, endDate, page = 1, limit = 50 } = req.query;

      console.log('=== GET ATTENDANCE HISTORY DEBUG ===');
      console.log('Employee ID:', employeeId);
      console.log('Date range:', { startDate, endDate });
      console.log('Pagination:', { page, limit });

      const result = await this.attendanceService.getAttendanceHistory({
        employeeId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      console.log('Attendance history count:', result.attendance?.length || 0);

      res.json(
        ApiResponse.success(
          {
            attendance: result.attendance,
            pagination: result.pagination,
            message: 'Attendance history retrieved'
          },
          'Attendance history retrieved'
        )
      );
    } catch (error) {
      console.error('Get attendance history controller error:', error);
      throw error;
    }
  }

  async autoClockOut(req, res) {
    try {
      const { latitude, longitude, address } = req.body;
      const employeeId = req.user.employeeId; // Get from authenticated user

      console.log('=== AUTO CLOCK OUT CONTROLLER DEBUG ===');
      console.log('Employee ID from auth:', employeeId);
      console.log('Location:', { latitude, longitude, address });

      // Find active attendance for this employee
      const activeAttendance = await this.attendanceService.getCurrentAttendance(employeeId);
      
      if (!activeAttendance) {
        throw new ApiError(404, 'No active attendance record found for clock out');
      }

      const attendance = await this.attendanceService.clockOut({
        attendanceId: activeAttendance.id,
        latitude,
        longitude,
        address
      });

      console.log('Auto clock out successful:', attendance);

      res.json(
        ApiResponse.success(
          { 
            attendance,
            message: 'Successfully clocked out'
          },
          'Auto clock out successful'
        )
      );
    } catch (error) {
      console.error('Auto clock out controller error:', error);
      throw error;
    }
  }

  async forceClockOut(req, res) {
    try {
      const { attendanceId } = req.params;
      const { latitude, longitude, address } = req.body;

      console.log('=== FORCE CLOCK OUT CONTROLLER DEBUG ===');
      console.log('Attendance ID:', attendanceId);

      const attendance = await this.attendanceService.clockOut({
        attendanceId,
        latitude,
        longitude,
        address
      });

      console.log('Force clock out successful:', attendance);

      res.json(
        ApiResponse.success(
          { 
            attendance,
            message: 'Successfully force clocked out'
          },
          'Force clock out successful'
        )
      );
    } catch (error) {
      console.error('Force clock out controller error:', error);
      throw error;
    }
  }

  async getClockStatus(req, res) {
    try {
      const employeeId = req.user.employeeId; // Get from authenticated user

      console.log('=== GET CLOCK STATUS DEBUG ===');
      console.log('Employee ID from auth:', employeeId);

      const attendance = await this.attendanceService.getCurrentAttendance(employeeId);

      console.log('Clock status attendance:', attendance);

      if (attendance) {
        res.json(
          ApiResponse.success(
            { 
              attendance,
              isClockedIn: true,
              message: 'Employee is currently clocked in'
            },
            'Clock status retrieved'
          )
        );
      } else {
        res.json(
          ApiResponse.success(
            { 
              attendance: null,
              isClockedIn: false,
              message: 'Employee is not clocked in'
            },
            'Clock status retrieved'
          )
        );
      }
    } catch (error) {
      console.error('Get clock status controller error:', error);
      throw error;
    }
  }
}

module.exports = AttendanceController;