const AttendanceRepository = require('../repositories/attendanceRepository');
const EmployeeRepository = require('../repositories/employeeRepository');
const { ApiError } = require('../middleware/errorHandler');
const { generateId } = require('../utils/crypto');

class AttendanceService {
  constructor() {
    this.attendanceRepository = new AttendanceRepository();
    this.employeeRepository = new EmployeeRepository();
  }

  async clockIn({ employeeId, latitude, longitude, address }) {
    console.log('=== ATTENDANCE SERVICE CLOCK IN ===');
    console.log('Employee ID:', employeeId);

    // Check if employee exists
    const employee = await this.employeeRepository.findById(employeeId);
    if (!employee) {
      throw new ApiError(404, 'Employee not found');
    }

    // Check if employee already has an active attendance record
    const activeAttendance = await this.attendanceRepository.findActiveByEmployeeId(employeeId);
    if (activeAttendance) {
      console.log('Employee already clocked in. Attendance ID:', activeAttendance.id);
      return {
        attendance: this.formatAttendanceResponse(activeAttendance),
        message: 'Employee is already clocked in',
        alreadyClockedIn: true
      };
    }

    // Create new attendance record
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const attendanceData = {
      id: generateId(),
      employee_id: employeeId,
      employee_name: employee.name,
      clock_in_time: now.toISOString(),
      clock_out_time: null,
      clock_in_location: `${latitude},${longitude}`,
      clock_out_location: null,
      clock_in_address: address,
      clock_out_address: null,
      total_hours: null,
      date: today,
      status: 'active',
      is_active: true,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    console.log('Creating attendance record...');
    const attendance = await this.attendanceRepository.create(attendanceData);
    
    // RECORD CLOCK-IN MOVEMENT
    console.log('Recording clock-in movement...');
    await this.recordMovement({
      employeeId,
      attendanceId: attendance.id,
      latitude,
      longitude, 
      address,
      reason: 'Clock-in',
      movementType: 'CLOCK_IN_PATH'
    });
    
    console.log('✅ Clock-in completed successfully');
    return this.formatAttendanceResponse(attendance);
  }

  async clockOut({ attendanceId, latitude, longitude, address }) {
    console.log('=== ATTENDANCE SERVICE CLOCK OUT ===');
    console.log('Attendance ID:', attendanceId);

    // Find the attendance record
    const attendance = await this.attendanceRepository.findById(attendanceId);
    if (!attendance) {
      throw new ApiError(404, 'Attendance record not found');
    }

    if (!attendance.is_active) {
      throw new ApiError(400, 'Attendance record is already clocked out');
    }

    // Calculate total hours
    const clockInTime = new Date(attendance.clock_in_time);
    const clockOutTime = new Date();
    const totalHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);

    // Update attendance record
    const updateData = {
      clock_out_time: clockOutTime.toISOString(),
      clock_out_location: `${latitude},${longitude}`,
      clock_out_address: address,
      total_hours: Math.round(totalHours * 100) / 100,
      status: 'completed',
      is_active: false,
      updated_at: new Date().toISOString()
    };

    console.log('Updating attendance record...');
    const updatedAttendance = await this.attendanceRepository.update(attendanceId, updateData);
    
    // RECORD CLOCK-OUT MOVEMENT
    console.log('Recording clock-out movement...');
    await this.recordMovement({
      employeeId: attendance.employee_id,
      attendanceId: attendanceId,
      latitude,
      longitude,
      address,
      reason: 'Clock-out',
      movementType: 'CLOCK_IN_PATH'
    });
    
    console.log('✅ Clock-out completed successfully');
    return this.formatAttendanceResponse(updatedAttendance);
  }

  // Universal movement recording method
  async recordMovement({ employeeId, attendanceId, latitude, longitude, address, reason, movementType = 'MANUAL_MOVEMENT' }) {
    try {
      console.log(`📍 Recording movement for employee ${employeeId}`);
      
      const Movement = require('../models/sequelize/Movement');
      const { sequelize } = require('../config/database');
      
      const movementData = {
        id: generateId(),
        employee_id: employeeId,
        timestamp: new Date().toISOString(),
        latitude: latitude,
        longitude: longitude,
        reason: reason,
        address: address || '',
        status: 'active'
      };

      // Only add these fields if they exist in the table
      try {
        // Try to add attendance_id if column exists
        movementData.attendance_id = attendanceId;
        movementData.movement_type = movementType;
      } catch (error) {
        console.log('Optional movement fields not available');
      }

      const movement = await Movement.create(movementData);
      console.log(`✅ Movement recorded: ${reason} at ${latitude}, ${longitude}`);
      return movement;
      
    } catch (error) {
      console.error('❌ Error recording movement:', error.message);
      // Don't throw error - movement recording shouldn't break clock in/out
    }
  }

  async getCurrentAttendance(employeeId) {
    console.log('=== GET CURRENT ATTENDANCE ===');
    console.log('Employee ID:', employeeId);

    const activeAttendance = await this.attendanceRepository.findActiveByEmployeeId(employeeId);
    
    if (activeAttendance) {
      console.log('Active attendance found:', activeAttendance.id);
      return this.formatAttendanceResponse(activeAttendance);
    } else {
      console.log('No active attendance found');
      return null;
    }
  }

  async getAttendanceHistory({ employeeId, startDate, endDate, page = 1, limit = 50 }) {
    console.log('=== GET ATTENDANCE HISTORY ===');
    console.log('Employee ID:', employeeId);
    console.log('Date range:', { startDate, endDate });

    const filters = { employee_id: employeeId };
    
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = startDate.toISOString().split('T')[0];
      if (endDate) filters.date.$lte = endDate.toISOString().split('T')[0];
    }

    const result = await this.attendanceRepository.findWithPagination(filters, {
      page,
      limit,
      sort: { created_at: -1 }
    });

    return {
      attendance: result.data?.map(record => this.formatAttendanceResponse(record)) || [],
      pagination: result.pagination
    };
  }

  formatAttendanceResponse(attendance) {
    if (!attendance) return null;
    const plainAttendance = attendance.get ? attendance.get({ plain: true }) : attendance;

    return {
      id: plainAttendance.id,
      employeeId: plainAttendance.employee_id,
      employeeName: plainAttendance.employee_name,
      clockInTime: plainAttendance.clock_in_time,
      clockOutTime: plainAttendance.clock_out_time,
      totalHours: plainAttendance.total_hours,
      clockInLocation: plainAttendance.clock_in_location,
      clockOutLocation: plainAttendance.clock_out_location,
      clockInAddress: plainAttendance.clock_in_address,
      clockOutAddress: plainAttendance.clock_out_address,
      status: plainAttendance.status,
      date: plainAttendance.date,
      isActive: plainAttendance.is_active,
      createdAt: plainAttendance.created_at,
      updatedAt: plainAttendance.updated_at
    };
  }
}

module.exports = AttendanceService;