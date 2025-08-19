const MovementRepository = require('../repositories/movementRepository');
const LocationRepository = require('../repositories/locationRepository');
const { ApiError } = require('../middleware/errorHandler');
const { generateId } = require('../utils/crypto');
const { MESSAGES } = require('../constants/messages');

class MovementService {
  constructor() {
    this.movementRepository = new MovementRepository();
    this.locationRepository = new LocationRepository();
  }

  async createMovement(movementData) {
    const { employeeId, latitude, longitude, reason, estimated_minutes, address, timestamp } = movementData;

    const movementTime = timestamp ? new Date(timestamp) : new Date();
    
    const data = {
      id: generateId(),
      employee_id: employeeId,
      timestamp: movementTime.toISOString(),
      latitude,
      longitude,
      reason: reason || 'General Movement',
      estimated_minutes: estimated_minutes || 0,
      status: 'active',
      address: address || ''
    };

    const record = await this.movementRepository.create(data);

    // Also create a location update
    const locationData = {
      id: generateId(),
      employee_id: employeeId,
      timestamp: movementTime.toISOString(),
      latitude,
      longitude,
      address: address || ''
    };

    await this.locationRepository.create(locationData);

    return record.toObject();
  }

  async updateMovement(movementId, employeeId, updateData) {
    const movement = await this.movementRepository.findById(movementId);
    
    if (!movement) {
      throw new ApiError(404, MESSAGES.MOVEMENT.NOT_FOUND);
    }

    if (movement.employee_id !== employeeId) {
      throw new ApiError(403, MESSAGES.AUTH.ACCESS_DENIED);
    }

    if (movement.status === 'completed') {
      throw new ApiError(400, MESSAGES.MOVEMENT.ALREADY_COMPLETED);
    }

    const allowedUpdates = ['return_time', 'status'];
    const filteredData = {};
    
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    // Calculate actual duration if completing movement
    if (filteredData.return_time && filteredData.status === 'completed') {
      const startTime = new Date(movement.timestamp);
      const endTime = new Date(filteredData.return_time);
      const durationMs = endTime - startTime;
      const durationMinutes = Math.floor(durationMs / (1000 * 60));
      filteredData.actual_duration_minutes = durationMinutes;
    }

    const updatedMovement = await this.movementRepository.update(movementId, filteredData);
    return updatedMovement.toObject();
  }

  async getMovementHistory(employeeId, options = {}) {
    return await this.movementRepository.findByEmployeeId(employeeId, options);
  }

  async getActiveMovements(employeeId) {
    const movements = await this.movementRepository.findActiveMovements(employeeId);
    return movements.map(m => m.toObject());
  }

  async getMovementById(movementId, employeeId) {
    const movement = await this.movementRepository.findById(movementId);
    
    if (!movement) {
      throw new ApiError(404, MESSAGES.MOVEMENT.NOT_FOUND);
    }

    if (movement.employee_id !== employeeId) {
      throw new ApiError(403, MESSAGES.AUTH.ACCESS_DENIED);
    }

    return movement.toObject();
  }
}

module.exports = MovementService;