const AttendanceRecord = require('../models/AttendanceRecord');

class AttendanceRepository {
  async create(attendanceData) {
    const record = new AttendanceRecord(attendanceData);
    return await record.save();
  }

  async findById(id) {
    return await AttendanceRecord.findOne({ id });
  }

  async update(id, updateData) {
    return await AttendanceRecord.findOneAndUpdate(
      { id },
      updateData,
      { new: true }
    );
  }

  async findByEmployeeId(employeeId, options = {}) {
    const { page = 1, limit = 10, startDate, endDate } = options;
    const skip = (page - 1) * limit;
    
    let filters = { employee_id: employeeId };
    
    if (startDate && endDate) {
      filters.login_time = {
        $gte: startDate,
        $lte: endDate
      };
    }
    
    const total = await AttendanceRecord.countDocuments(filters);
    const records = await AttendanceRecord.find(filters)
      .sort({ login_time: -1 })
      .skip(skip)
      .limit(limit);

    return { records, total, page, limit };
  }

  async findActiveRecordForToday(employeeId, startOfDay, endOfDay) {
    return await AttendanceRecord.findOne({
      employee_id: employeeId,
      login_time: {
        $gte: startOfDay,
        $lt: endOfDay
      },
      status: 'active'
    });
  }

  async findTodayRecord(employeeId, startOfDay, endOfDay) {
    return await AttendanceRecord.findOne({
      employee_id: employeeId,
      login_time: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    }).sort({ login_time: -1 });
  }
}

module.exports = AttendanceRepository;