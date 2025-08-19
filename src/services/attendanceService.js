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
      // Return the existing active attendance instead of throwing error
      return {
        attendance: this.formatAttendanceResponse(activeAttendance),
        message: 'Employee is already clocked in',
        alreadyClockedIn: true
      };
    }

    // Create new attendance record
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format

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

    console.log('Creating attendance record:', attendanceData);

    const attendance = await this.attendanceRepository.create(attendanceData);
    
    console.log('Attendance record created successfully');
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
    const totalHours = (clockOutTime - clockInTime) / (1000 * 60 * 60); // Convert to hours

    // Update attendance record
    const updateData = {
      clock_out_time: clockOutTime.toISOString(),
      clock_out_location: `${latitude},${longitude}`,
      clock_out_address: address,
      total_hours: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
      status: 'completed',
      is_active: false,
      updated_at: new Date().toISOString()
    };

    console.log('Updating attendance with:', updateData);

    const updatedAttendance = await this.attendanceRepository.update(attendanceId, updateData);
    
    console.log('Attendance record updated successfully');
    return this.formatAttendanceResponse(updatedAttendance);
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

    // Build query filters
    const filters = { employee_id: employeeId };
    
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) {
        filters.date.$gte = startDate.toISOString().split('T')[0];
      }
      if (endDate) {
        filters.date.$lte = endDate.toISOString().split('T')[0];
      }
    }

    const result = await this.attendanceRepository.findWithPagination(filters, {
      page,
      limit,
      sort: { created_at: -1 } // Most recent first
    });

    console.log('Found attendance records:', result.data?.length || 0);

    return {
      attendance: result.data?.map(record => this.formatAttendanceResponse(record)) || [],
      pagination: result.pagination
    };
  }

  formatAttendanceResponse(attendance) {
    if (!attendance) return null;

    // Convert to plain object if it's a mongoose document
    const plainAttendance = attendance.toObject ? attendance.toObject() : attendance;

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