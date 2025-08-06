const LocationUpdate = require('../models/LocationUpdates');

class LocationRepository {
  async create(locationData) {
    const record = new LocationUpdate(locationData);
    return await record.save();
  }

  async findByEmployeeId(employeeId, options = {}) {
    const { page = 1, limit = 100, startDate, endDate } = options;
    const skip = (page - 1) * limit;
    
    let filters = { employee_id: employeeId };
    
    if (startDate && endDate) {
      filters.timestamp = {
        $gte: startDate,
        $lte: endDate
      };
    }
    
    const total = await LocationUpdate.countDocuments(filters);
    const updates = await LocationUpdate.find(filters)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    return { updates, total, page, limit };
  }

  async findLatestLocation(employeeId) {
    return await LocationUpdate.findOne({
      employee_id: employeeId
    }).sort({ timestamp: -1 });
  }

  async cleanupOldRecords(employeeId, maxRecords = 1000) {
    const total = await LocationUpdate.countDocuments({ employee_id: employeeId });
    
    if (total > maxRecords) {
      const oldestRecords = await LocationUpdate.find({ employee_id: employeeId })
        .sort({ timestamp: 1 })
        .limit(total - maxRecords)
        .select('_id');
      
      const idsToDelete = oldestRecords.map(record => record._id);
      await LocationUpdate.deleteMany({ _id: { $in: idsToDelete } });
    }
  }
}

module.exports = LocationRepository;