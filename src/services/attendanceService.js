const AttendanceRepository = require('../repositories/attendanceRepository');
const LocationRepository = require('../repositories/locationRepository');
const { ApiError } = require('../middleware/errorHandler');
const { generateId } = require('../utils/crypto');
const LocationUtils = require('../utils/location');
const { OFFICE_LATITUDE, OFFICE_LONGITUDE, OFFICE_RADIUS } = require('../config/environment');
const { MESSAGES } = require('../constants/messages');

class AttendanceService {
  constructor() {
    this.attendanceRepository = new AttendanceRepository();
    this.locationRepository = new LocationRepository();
  }

  async clockIn(clockInData) {
    const { employeeId, latitude, longitude, address, accuracy, timestamp, device_info } = clockInData;

    // Check if employee already has an active attendance record for today
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    const existingRecord = await this.attendanceRepository.findActiveRecordForToday(employeeId, startOfDay, endOfDay);
    if (existingRecord) {
      throw new ApiError(409, MESSAGES.ATTENDANCE.ALREADY_CLOCKED_IN);
    }

    // Validate office location if configured
    const officeValidation = LocationUtils.validateOfficeLocation(latitude, longitude, {
      latitude: OFFICE_LATITUDE,
      longitude: OFFICE_LONGITUDE,
      radius: OFFICE_RADIUS
    });

    const clockInTime = timestamp ? new Date(timestamp) : new Date();
    
    // Create attendance record
    const attendanceData = {
      id: generateId(),
      employee_id: employeeId,
      login_time: clockInTime.toISOString(),
      login_latitude: latitude,
      login_longitude: longitude,
      login_address: address || '',
      status: 'active',
      reason: 'Regular Work'
    };

    const record = await this.attendanceRepository.create(attendanceData);

    // Create location update
    const locationData = {
      id: generateId(),
      employee_id: employeeId,
      timestamp: clockInTime.toISOString(),
      latitude,
      longitude,
      accuracy: accuracy || null,
      address: address || '',
      battery_level: device_info?.battery_level || null,
      is_mock_location: device_info?.is_mock_location || false
    };

    await this.locationRepository.create(locationData);

    return {
      record: record.toObject(),
      location: {
        latitude,
        longitude,
        address: address || '',
        accuracy: accuracy || null
      },
      office_validation: officeValidation,
      clock_in_time: record.login_time
    };
  }

  async clockOut(clockOutData) {
    const { employeeId, latitude, longitude, address, accuracy, timestamp, device_info } = clockOutData;

    // Find active attendance record for today
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    const activeRecord = await this.attendanceRepository.findActiveRecordForToday(employeeId, startOfDay, endOfDay);
    if (!activeRecord) {
      throw new ApiError(404, MESSAGES.ATTENDANCE.NOT_CLOCKED_IN);
    }

    const clockOutTime = timestamp ? new Date(timestamp) : new Date();
    
    // Calculate work duration
    const loginTime = new Date(activeRecord.login_time);
    const workDurationMs = clockOutTime - loginTime;
    const workDurationMinutes = Math.floor(workDurationMs / (1000 * 60));

    // Update attendance record
    const updateData = {
      logout_time: clockOutTime.toISOString(),
      logout_latitude: latitude,
      logout_longitude: longitude,
      logout_address: address || '',
      status: 'completed',
      work_duration_minutes: workDurationMinutes
    };

    const updatedRecord = await this.attendanceRepository.update(activeRecord.id, updateData);

    // Create location update for clock-out
    const locationData = {
      id: generateId(),
      employee_id: employeeId,
      timestamp: clockOutTime.toISOString(),
      latitude,
      longitude,
      accuracy: accuracy || null,
      address: address || '',
      battery_level: device_info?.battery_level || null,
      is_mock_location: device_info?.is_mock_location || false
    };

    await this.locationRepository.create(locationData);

    const workDurationHours = Math.floor(workDurationMinutes / 60);
    const remainingMinutes = workDurationMinutes % 60;

    return {
      record: updatedRecord.toObject(),
      location: {
        latitude,
        longitude,
        address: address || '',
        accuracy: accuracy || null
      },
      work_duration: {
        hours: workDurationHours,
        minutes: remainingMinutes,
        total_minutes: workDurationMinutes,
        formatted: `${workDurationHours}h ${remainingMinutes}m`
      }
    };
  }

  async getCurrentStatus(employeeId) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    const todayRecord = await this.attendanceRepository.findTodayRecord(employeeId, startOfDay, endOfDay);
    
    if (!todayRecord) {
      return {
        is_clocked_in: false,
        message: 'Not clocked in today',
        record: null,
        work_duration: null
      };
    }

    const isActive = todayRecord.status === 'active';
    let workDuration = null;

    if (todayRecord.login_time) {
      const loginTime = new Date(todayRecord.login_time);
      const currentTime = todayRecord.logout_time ? new Date(todayRecord.logout_time) : new Date();
      const workDurationMs = currentTime - loginTime;
      const totalMinutes = Math.floor(workDurationMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      workDuration = {
        hours,
        minutes,
        total_minutes: totalMinutes,
        formatted: `${hours}h ${minutes}m`
      };
    }

    return {
      is_clocked_in: isActive,
      record: todayRecord.toObject(),
      work_duration: workDuration,
      status: todayRecord.status
    };
  }

  async getAttendanceHistory(employeeId, options = {}) {
    return await this.attendanceRepository.findByEmployeeId(employeeId, options);
  }
}

module.exports = AttendanceService;