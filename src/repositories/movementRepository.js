const Movement = require('../models/sequelize/Movement');
const { Op } = require('sequelize');

class MovementRepository {
  async create(movementData) {
    try {
      const movement = await Movement.create(movementData);
      return movement;
    } catch (error) {
      console.error('Error creating movement record:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      return await Movement.findOne({ where: { id } });
    } catch (error) {
      console.error('Error finding movement by ID:', error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const [affectedCount, updatedMovements] = await Movement.update(
        updateData,
        {
          where: { id },
          returning: true
        }
      );

      if (affectedCount === 0) {
        throw new Error('Movement record not found');
      }

      return updatedMovements[0];
    } catch (error) {
      console.error('Error updating movement record:', error);
      throw error;
    }
  }

  async findByEmployeeId(employeeId, options = {}) {
    try {
      const { page = 1, limit = 10, startDate, endDate } = options;
      const offset = (page - 1) * limit;
      
      let whereClause = { employee_id: employeeId };
      
      if (startDate && endDate) {
        whereClause.timestamp = {
          [Op.between]: [startDate, endDate]
        };
      }
      
      const { count, rows: records } = await Movement.findAndCountAll({
        where: whereClause,
        order: [['timestamp', 'DESC']],
        offset: offset,
        limit: limit
      });

      return { 
        records, 
        total: count, 
        page, 
        limit 
      };

    } catch (error) {
      console.error('Error finding movements by employee ID:', error);
      throw error;
    }
  }

  async findActiveMovements(employeeId) {
    try {
      return await Movement.findAll({
        where: {
          employee_id: employeeId,
          status: 'active'
        },
        order: [['timestamp', 'DESC']]
      });
    } catch (error) {
      console.error('Error finding active movements:', error);
      throw error;
    }
  }
}

module.exports = MovementRepository;