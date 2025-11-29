const TimingReport = require('../models/sequelize/TimingReport');
const { Op } = require('sequelize');

class TimingReportRepository {
  async create(timingReportData) {
    try {
      const timingReport = await TimingReport.create(timingReportData);
      return timingReport;
    } catch (error) {
      console.error('Error creating timing report:', error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const [affectedCount, updatedReports] = await TimingReport.update(
        updateData,
        {
          where: { id },
          returning: true
        }
      );

      if (affectedCount === 0) {
        throw new Error('Timing report not found');
      }

      return updatedReports[0];
    } catch (error) {
      console.error('Error updating timing report:', error);
      throw error;
    }
  }

  async findByEmployeeAndDate(employeeId, date) {
    try {
      return await TimingReport.findOne({
        where: {
          employee_id: employeeId,
          date: date
        }
      });
    } catch (error) {
      console.error('Error finding timing report:', error);
      throw error;
    }
  }

  async findWithFilters(filters = {}) {
    try {
      const { 
        employeeId, 
        department, 
        office, 
        startDate, 
        endDate, 
        page = 1, 
        limit = 50 
      } = filters;

      const offset = (page - 1) * limit;
      
      let whereClause = {};

      if (employeeId) {
        whereClause.employee_id = employeeId;
      }

      if (department) {
        whereClause.department = department;
      }

      if (office) {
        whereClause.office = office;
      }

      if (startDate || endDate) {
        whereClause.date = {};
        if (startDate) whereClause.date[Op.gte] = startDate;
        if (endDate) whereClause.date[Op.lte] = endDate;
      }

      const { count, rows: data } = await TimingReport.findAndCountAll({
        where: whereClause,
        order: [['date', 'DESC']],
        offset: offset,
        limit: limit
      });

      const totalPages = Math.ceil(count / limit);

      return {
        data,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_records: count,
          records_per_page: limit,
          has_next_page: page < totalPages,
          has_prev_page: page > 1
        }
      };
    } catch (error) {
      console.error('Error finding timing reports with filters:', error);
      throw error;
    }
  }
}

module.exports = TimingReportRepository;