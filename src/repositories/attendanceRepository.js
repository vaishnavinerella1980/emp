const Attendance = require('../models/sequelize/attendance');
const { ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

class AttendanceRepository {
  async create(attendanceData) {
    try {
      console.log('Creating attendance record in PostgreSQL...');
      const attendance = await Attendance.create(attendanceData);
      console.log('Attendance record saved successfully');
      return attendance;

    } catch (error) {
      console.error('Error creating attendance record:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ApiError(409, 'Duplicate attendance record');
      }
      throw new ApiError(500, `Failed to create attendance record: ${error.message}`);
    }
  }

  async findById(attendanceId) {
    try {
      console.log('Finding attendance by ID:', attendanceId);
      const attendance = await Attendance.findOne({ 
        where: { id: attendanceId } 
      });
      console.log('Attendance found:', !!attendance);
      return attendance;

    } catch (error) {
      console.error('Error finding attendance by ID:', error);
      throw new ApiError(500, `Failed to find attendance: ${error.message}`);
    }
  }

  async findActiveByEmployeeId(employeeId) {
    try {
      console.log('Finding active attendance for employee:', employeeId);
      const attendance = await Attendance.findOne({
        where: {
          employee_id: employeeId,
          is_active: true,
          status: 'active'
        },
        order: [['created_at', 'DESC']]
      });
      
      console.log('Active attendance found:', !!attendance);
      return attendance;

    } catch (error) {
      console.error('Error finding active attendance:', error);
      throw new ApiError(500, `Failed to find active attendance: ${error.message}`);
    }
  }

  async findByEmployeeId(employeeId, filters = {}) {
    try {
      console.log('Finding attendance records for employee:', employeeId);
      const whereClause = { employee_id: employeeId, ...filters };
      
      const attendanceRecords = await Attendance.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']]
      });
      
      console.log('Found attendance records:', attendanceRecords.length);
      return attendanceRecords;

    } catch (error) {
      console.error('Error finding attendance records:', error);
      throw new ApiError(500, `Failed to find attendance records: ${error.message}`);
    }
  }

  async findWithPagination(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        sort = [['created_at', 'DESC']]
      } = options;

      const offset = (page - 1) * limit;

      console.log('Finding attendance with pagination:', {
        filters,
        page,
        limit,
        offset
      });

      const { count, rows: data } = await Attendance.findAndCountAll({
        where: filters,
        order: sort,
        offset: offset,
        limit: limit
      });

      const totalPages = Math.ceil(count / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      console.log('Pagination results:', {
        total: count,
        totalPages,
        currentPage: page,
        recordsCount: data.length
      });

      return {
        data,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_records: count,
          records_per_page: limit,
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage
        }
      };

    } catch (error) {
      console.error('Error in findWithPagination:', error);
      throw new ApiError(500, `Failed to find attendance records: ${error.message}`);
    }
  }

  async update(attendanceId, updateData) {
    try {
      console.log('Updating attendance record:', attendanceId);
      console.log('Update data:', updateData);

      const [affectedCount, updatedAttendances] = await Attendance.update(
        updateData,
        {
          where: { id: attendanceId },
          returning: true
        }
      );

      if (affectedCount === 0) {
        throw new ApiError(404, 'Attendance record not found');
      }

      console.log('Attendance record updated successfully');
      return updatedAttendances[0];

    } catch (error) {
      console.error('Error updating attendance record:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Failed to update attendance record: ${error.message}`);
    }
  }

  async delete(attendanceId) {
    try {
      console.log('Deleting attendance record:', attendanceId);
      const affectedCount = await Attendance.destroy({
        where: { id: attendanceId }
      });
      
      if (affectedCount === 0) {
        throw new ApiError(404, 'Attendance record not found');
      }

      console.log('Attendance record deleted successfully');
      return true;

    } catch (error) {
      console.error('Error deleting attendance record:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Failed to delete attendance record: ${error.message}`);
    }
  }

  async getAttendanceStats(employeeId, startDate, endDate) {
    try {
      console.log('Getting attendance stats for employee:', employeeId);
      
      const whereClause = { 
        employee_id: employeeId,
        status: 'completed'
      };

      if (startDate || endDate) {
        whereClause.date = {};
        if (startDate) whereClause.date[Op.gte] = startDate;
        if (endDate) whereClause.date[Op.lte] = endDate;
      }

      const stats = await Attendance.findAll({
        where: whereClause,
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_days'],
          [sequelize.fn('SUM', sequelize.col('total_hours')), 'total_hours'],
          [sequelize.fn('AVG', sequelize.col('total_hours')), 'average_hours']
        ],
        raw: true
      });

      const result = stats[0] || {
        total_days: 0,
        total_hours: 0,
        average_hours: 0
      };

      console.log('Attendance stats:', result);
      return result;

    } catch (error) {
      console.error('Error getting attendance stats:', error);
      throw new ApiError(500, `Failed to get attendance stats: ${error.message}`);
    }
  }
}

module.exports = AttendanceRepository;