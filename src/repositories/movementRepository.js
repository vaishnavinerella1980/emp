const MovementRecord = require('../models/MovementRecord');

class MovementRepository {
  async create(movementData) {
    const record = new MovementRecord(movementData);
    return await record.save();
  }

  async findById(id) {
    return await MovementRecord.findOne({ id });
  }

  async update(id, updateData) {
    return await MovementRecord.findOneAndUpdate(
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
      filters.timestamp = {
        $gte: startDate,
        $lte: endDate
      };
    }
    
    const total = await MovementRecord.countDocuments(filters);
    const records = await MovementRecord.find(filters)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    return { records, total, page, limit };
  }

  async findActiveMovements(employeeId) {
    return await MovementRecord.find({
      employee_id: employeeId,
      status: 'active'
    }).sort({ timestamp: -1 });
  }
}

module.exports = MovementRepository;