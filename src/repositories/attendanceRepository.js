const Attendance = require('../models/AttendanceRecord');
const { ApiError } = require('../middleware/errorHandler');

class AttendanceRepository {
  async create(attendanceData) {
    try {
      console.log('Creating attendance record in database...');
      const attendance = new Attendance(attendanceData);
      const savedAttendance = await attendance.save();
      console.log('Attendance record saved successfully');
      return savedAttendance;
    } catch (error) {
      console.error('Error creating attendance record:', error);
      if (error.code === 11000) {
        throw new ApiError(409, 'Duplicate attendance record');
      }
      throw new ApiError(500, `Failed to create attendance record: ${error.message}`);
    }
  }

  async findById(attendanceId) {
    try {
      console.log('Finding attendance by ID:', attendanceId);
      const attendance = await Attendance.findOne({ id: attendanceId });
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
        employee_id: employeeId,
        is_active: true,
        status: 'active'
      }).sort({ created_at: -1 });
      
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
      const query = { employee_id: employeeId, ...filters };
      const attendanceRecords = await Attendance.find(query).sort({ created_at: -1 });
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
        sort = { created_at: -1 }
      } = options;

      const skip = (page - 1) * limit;

      console.log('Finding attendance with pagination:', {
        filters,
        page,
        limit,
        skip
      });

      const [data, total] = await Promise.all([
        Attendance.find(filters)
          .sort(sort)
          .skip(skip)
          .limit(limit),
        Attendance.countDocuments(filters)
      ]);

      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      console.log('Pagination results:', {
        total,
        totalPages,
        currentPage: page,
        recordsCount: data.length
      });

      return {
        data,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_records: total,
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

      const attendance = await Attendance.findOneAndUpdate(
        { id: attendanceId },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!attendance) {
        throw new ApiError(404, 'Attendance record not found');
      }

      console.log('Attendance record updated successfully');
      return attendance;
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
      const result = await Attendance.deleteOne({ id: attendanceId });
      
      if (result.deletedCount === 0) {
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
      
      const matchStage = { 
        employee_id: employeeId,
        status: 'completed'
      };

      if (startDate || endDate) {
        matchStage.date = {};
        if (startDate) matchStage.date.$gte = startDate;
        if (endDate) matchStage.date.$lte = endDate;
      }

      const stats = await Attendance.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total_days: { $sum: 1 },
            total_hours: { $sum: '$total_hours' },
            average_hours: { $avg: '$total_hours' }
          }
        }
      ]);

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