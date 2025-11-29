const AttendanceRepository = require('../repositories/attendanceRepository');
const EmployeeRepository = require('../repositories/employeeRepository');
const MovementRepository = require('../repositories/movementRepository');
const LocationService = require('./locationService');
const { generateId } = require('../utils/crypto');
const { ApiError } = require('../middleware/errorHandler');
const { MESSAGES } = require('../constants/messages');
const LocationUtils = require('../utils/location');
const { OFFICE_LATITUDE, OFFICE_LONGITUDE, OFFICE_RADIUS, IOTIQ_LATITUDE, IOTIQ_LONGITUDE, IOTIQ_RADIUS } = require('../config/environment');
const { OFFICES } = require('../config/constants');
const { Op } = require('sequelize');

class AttendanceService {
  constructor() {
    this.attendanceRepository = new AttendanceRepository();
    this.employeeRepository = new EmployeeRepository();
    this.movementRepository = new MovementRepository();
    this.locationService = new LocationService();
  }

  async clockIn(clockInData) {
    try {
      const { employeeId, latitude, longitude, address } = clockInData;

      console.log('=== CLOCK IN SERVICE DEBUG ===');
      console.log('Employee ID:', employeeId);
      console.log('Location:', { latitude, longitude, address });

      // Check if employee exists and is active
      const employee = await this.employeeRepository.findById(employeeId);
      if (!employee) {
        throw new ApiError(404, MESSAGES.EMPLOYEE.NOT_FOUND);
      }

      if (!employee.is_active) {
        throw new ApiError(400, 'Employee account is deactivated');
      }

      // Check if already clocked in
      const activeAttendance = await this.attendanceRepository.findActiveByEmployeeId(employeeId);
      if (activeAttendance) {
        console.log('Employee already clocked in, returning existing record');
        return {
          attendance: activeAttendance,
          message: MESSAGES.ATTENDANCE.ALREADY_CLOCKED_IN,
          alreadyClockedIn: true
        };
      }

      // 🚨 REMOVED LOCATION VALIDATION - EMPLOYEES CAN CLOCK IN FROM ANYWHERE
      console.log('✅ Location validation bypassed - allowing clock in from any location');

      // Auto-detect office for address labeling only (no restriction)
      const detectedOffice = this.detectOfficeForAddress(latitude, longitude, employee.office);
      const finalAddress = detectedOffice ? `${detectedOffice} Office` : address;

      // Create attendance record
      const attendanceId = generateId();
      const now = new Date();
      
      const attendanceData = {
        id: attendanceId,
        employee_id: employeeId,
        employee_name: employee.name,
        clock_in_time: now.toISOString(),
        clock_in_location: `${latitude},${longitude}`,
        clock_in_address: finalAddress,
        date: now.toISOString().split('T')[0], // YYYY-MM-DD
        status: 'active',
        is_active: true
      };

      console.log('Creating attendance record:', attendanceData);
      const attendance = await this.attendanceRepository.create(attendanceData);

      // Log the clock-in location for path tracking
      await this.locationService.updateLocation({
        employeeId,
        latitude,
        longitude,
        address: finalAddress,
        timestamp: now.toISOString()
      });

      console.log('✅ Clock in successful from location');
      return attendance;

    } catch (error) {
      console.error('Clock in service error:', error);
      throw error;
    }
  }

  async clockOut(clockOutData) {
    try {
      const { attendanceId, latitude, longitude, address } = clockOutData;

      console.log('=== CLOCK OUT SERVICE DEBUG ===');
      console.log('Attendance ID:', attendanceId);
      console.log('Location:', { latitude, longitude, address });

      // Find attendance record
      const attendance = await this.attendanceRepository.findById(attendanceId);
      if (!attendance) {
        throw new ApiError(404, MESSAGES.ATTENDANCE.ATTENDANCE_NOT_FOUND);
      }

      if (attendance.clock_out_time) {
        throw new ApiError(400, MESSAGES.ATTENDANCE.ALREADY_CLOCKED_OUT);
      }

      // Auto-detect office for address labeling only (no restriction)
      const detectedOffice = this.detectOfficeForAddress(latitude, longitude, attendance.employee_office);
      const finalAddress = detectedOffice ? `${detectedOffice} Office` : address;

      // Update attendance record
      const now = new Date();
      const clockInTime = new Date(attendance.clock_in_time);
      const totalHours = (now - clockInTime) / (1000 * 60 * 60); // Convert ms to hours

      const updateData = {
        clock_out_time: now.toISOString(),
        clock_out_location: `${latitude},${longitude}`,
        clock_out_address: finalAddress,
        total_hours: parseFloat(totalHours.toFixed(2)),
        status: 'completed',
        is_active: false
      };

      console.log('Updating attendance with:', updateData);
      const updatedAttendance = await this.attendanceRepository.update(attendanceId, updateData);

      // Log the clock-out location for path tracking
      await this.locationService.updateLocation({
        employeeId: attendance.employee_id,
        latitude,
        longitude,
        address: finalAddress,
        timestamp: now.toISOString()
      });

      console.log('✅ Clock out successful from location');
      return updatedAttendance;

    } catch (error) {
      console.error('Clock out service error:', error);
      throw error;
    }
  }

  async getCurrentAttendance(employeeId) {
    try {
      console.log('Getting current attendance for employee:', employeeId);
      const attendance = await this.attendanceRepository.findActiveByEmployeeId(employeeId);
      return attendance;
    } catch (error) {
      console.error('Get current attendance service error:', error);
      throw error;
    }
  }

  async getAttendanceHistory(filters) {
    try {
      const { employeeId, startDate, endDate, page, limit } = filters;

      console.log('Getting attendance history with filters:', filters);

      const queryFilters = { employee_id: employeeId };
      
      if (startDate || endDate) {
        queryFilters.date = {};
        if (startDate) queryFilters.date.$gte = startDate;
        if (endDate) queryFilters.date.$lte = endDate;
      }

      const result = await this.attendanceRepository.findWithPagination(queryFilters, {
        page,
        limit,
        sort: [['created_at', 'DESC']]
      });

      console.log('Attendance history retrieved:', result.data.length, 'records');
      return result;

    } catch (error) {
      console.error('Get attendance history service error:', error);
      throw error;
    }
  }

  async getTimingReports(filters) {
    try {
      const { employeeId, department, office, startDate, endDate, page, limit } = filters;

      console.log('Getting timing reports with filters:', filters);

      const queryFilters = {};
      
      if (employeeId) queryFilters.employee_id = employeeId;
      if (department) queryFilters.department = department;
      if (office) queryFilters.office = office;
      
      if (startDate || endDate) {
        queryFilters.date = {};
        if (startDate) queryFilters.date.$gte = startDate;
        if (endDate) queryFilters.date.$lte = endDate;
      }

      const result = await this.attendanceRepository.findWithPagination(queryFilters, {
        page,
        limit,
        sort: [['date', 'DESC'], ['clock_in_time', 'DESC']]
      });

      console.log('Timing reports retrieved:', result.data.length, 'records');
      
      return {
        timingReports: result.data,
        pagination: result.pagination
      };

    } catch (error) {
      console.error('Get timing reports service error:', error);
      throw error;
    }
  }

  async getDashboardStats(managerId = null) {
    try {
      console.log('Getting dashboard stats, managerId:', managerId);

      const today = new Date().toISOString().split('T')[0];
      
      // Get real data from database
      const Employee = require('../models/sequelize/Employee');
      const Attendance = require('../models/sequelize/attendance');
      const Movement = require('../models/sequelize/Movement');

      // 1. Total active employees
      const totalEmployees = await Employee.count({
        where: { is_active: true }
      });

      // 2. Employees clocked in today
      const clockedInToday = await Attendance.count({
        where: {
          date: today,
          status: 'active'
        },
        distinct: true,
        col: 'employee_id'
      });

      // 3. Today's attendance breakdown
      const todaysAttendance = await Attendance.findAll({
        where: { date: today },
        attributes: [
          'employee_id',
          'status',
          'clock_in_time',
          'clock_out_time'
        ]
      });

      const present = todaysAttendance.filter(a => a.status === 'completed' || a.status === 'active').length;
      const absent = totalEmployees - present; // Simplified calculation
      
      // 4. Active movements
      const activeMovements = await Movement.count({
        where: { status: 'active' }
      });

      // 5. Department stats
      const departmentStats = {};
      const departments = await Employee.findAll({
        where: { is_active: true },
        attributes: [
          'department',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total']
        ],
        group: ['department']
      });

      for (const dept of departments) {
        const presentInDept = await Attendance.count({
          include: [{
            model: Employee,
            where: { department: dept.department }
          }],
          where: { 
            date: today,
            status: { [Op.in]: ['active', 'completed'] }
          },
          distinct: true,
          col: 'employee_id'
        });

        departmentStats[dept.department] = {
          present: presentInDept,
          total: dept.get('total')
        };
      }

      const stats = {
        totalEmployees,
        clockedInToday,
        onLeave: 0, // You can add leave tracking later
        activeMovements,
        todaysAttendance: {
          present,
          absent,
          late: 0 // You can add late calculation logic
        },
        departmentStats
      };

      console.log('Dashboard stats generated from database:', stats);
      return stats;

    } catch (error) {
      console.error('Get dashboard stats service error:', error);
      throw error;
    }
  }

  // 🚨 COMPLETELY REMOVED validateOfficeLocation method - No more location restrictions!

  // 🆕 NEW METHOD: Only for auto-detecting office in address (no restrictions)
  detectOfficeForAddress(latitude, longitude, employeeOffice) {
    let officeConfig;
    
    if (employeeOffice === OFFICES.IOTIQ) {
      officeConfig = {
        latitude: IOTIQ_LATITUDE,
        longitude: IOTIQ_LONGITUDE,
        radius: 100 // 100m for auto-office detection only
      };
    } else {
      officeConfig = {
        latitude: OFFICE_LATITUDE,
        longitude: OFFICE_LONGITUDE,
        radius: 100 // 100m for auto-office detection only
      };
    }

    // Only check if within office radius for address labeling
    const distance = LocationUtils.calculateDistance(
      latitude, 
      longitude, 
      officeConfig.latitude, 
      officeConfig.longitude
    );
    
    if (distance <= officeConfig.radius) {
      return employeeOffice === OFFICES.IOTIQ ? 'IOTIQ' : 'ACS';
    }
    
    return null; // Not near office, but still allowed to clock in/out
  }

  // 🆕 NEW METHOD: Get Complete Path for an Attendance Session
  async getAttendancePath(attendanceId) {
    try {
      console.log(`📍 Generating path for attendance: ${attendanceId}`);
      
      const attendance = await this.attendanceRepository.findById(attendanceId);
      if (!attendance) {
        throw new ApiError(404, 'Attendance record not found');
      }

      // Get all location points between clock-in and clock-out
      const endTime = attendance.clock_out_time || new Date(); // Use current time if still active
      
      const path = await this.locationService.getMovementPath(
        attendance.employee_id,
        attendance.clock_in_time,
        endTime
      );

      // Add attendance info to the path
      path.attendance = {
        id: attendance.id,
        employee_name: attendance.employee_name,
        clock_in_time: attendance.clock_in_time,
        clock_out_time: attendance.clock_out_time,
        total_hours: attendance.total_hours
      };

      console.log(`✅ Generated attendance path with ${path.totalPoints} points`);
      return path;

    } catch (error) {
      console.error('❌ Error generating attendance path:', error);
      throw error;
    }
  }

  // 🆕 NEW METHOD: Get Employee's Today Path
  async getTodaysPath(employeeId) {
    try {
      console.log(`📍 Generating today's path for employee: ${employeeId}`);
      
      const today = new Date().toISOString().split('T')[0];
      const startOfDay = new Date(today + 'T00:00:00.000Z');
      const endOfDay = new Date(today + 'T23:59:59.999Z');

      const path = await this.locationService.getMovementPath(
        employeeId,
        startOfDay,
        endOfDay
      );

      // Get today's attendance info
      const todaysAttendance = await this.attendanceRepository.findWithPagination({
        employee_id: employeeId,
        date: today
      }, { limit: 1 });

      path.todays_attendance = todaysAttendance.data[0] || null;

      console.log(`✅ Generated today's path with ${path.totalPoints} points`);
      return path;

    } catch (error) {
      console.error('❌ Error generating today path:', error);
      throw error;
    }
  }

  // 🆕 NEW METHOD: Update location during active attendance (for continuous tracking)
  async updateAttendanceLocation(employeeId, locationData) {
    try {
      console.log(`📍 Updating location for active attendance of employee: ${employeeId}`);
      
      // Check if employee has active attendance
      const activeAttendance = await this.getCurrentAttendance(employeeId);
      if (!activeAttendance) {
        throw new ApiError(400, 'No active attendance found for location update');
      }

      // Update location with attendance context
      const locationWithContext = {
        ...locationData,
        employeeId,
        attendance_id: activeAttendance.id // Link location to specific attendance
      };

      const updatedLocation = await this.locationService.updateLocation(locationWithContext);

      console.log('✅ Attendance location updated successfully');
      return updatedLocation;

    } catch (error) {
      console.error('❌ Error updating attendance location:', error);
      throw error;
    }
  }
}

module.exports = AttendanceService;