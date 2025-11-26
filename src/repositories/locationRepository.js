const Location = require('../models/sequelize/Location');
const { Op } = require('sequelize');

class LocationRepository {
  async create(locationData) {
    try {
      const record = await Location.create(locationData);
      return record;
    } catch (error) {
      console.error('Error creating location record:', error);
      throw error;
    }
  }

  async findByEmployeeId(employeeId, options = {}) {
    try {
      const { page = 1, limit = 100, startDate, endDate } = options;
      const offset = (page - 1) * limit;
      
      let whereClause = { employee_id: employeeId };
      
      if (startDate && endDate) {
        whereClause.timestamp = {
          [Op.between]: [startDate, endDate]
        };
      }
      
      const { count, rows: updates } = await Location.findAndCountAll({
        where: whereClause,
        order: [['timestamp', 'DESC']],
        offset: offset,
        limit: limit
      });

      return { updates, total: count, page, limit };
    } catch (error) {
      console.error('Error finding locations by employee ID:', error);
      throw error;
    }
  }

  async findLatestLocation(employeeId) {
    try {
      return await Location.findOne({
        where: { employee_id: employeeId },
        order: [['timestamp', 'DESC']]
      });
    } catch (error) {
      console.error('Error finding latest location:', error);
      throw error;
    }
  }

  async cleanupOldRecords(employeeId, maxRecords = 1000) {
    try {
      const total = await Location.count({
        where: { employee_id: employeeId }
      });
      
      if (total > maxRecords) {
        const recordsToDelete = total - maxRecords;
        
        // Find oldest records to delete
        const oldestRecords = await Location.findAll({
          where: { employee_id: employeeId },
          order: [['timestamp', 'ASC']],
          limit: recordsToDelete,
          attributes: ['id']
        });
        
        const idsToDelete = oldestRecords.map(record => record.id);
        await Location.destroy({
          where: { id: idsToDelete }
        });
        
        console.log(`Cleaned up ${idsToDelete.length} old location records`);
      }
    } catch (error) {
      console.error('Error cleaning up old location records:', error);
      throw error;
    }
  }
}

module.exports = LocationRepository;