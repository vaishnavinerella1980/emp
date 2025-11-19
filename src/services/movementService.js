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

  /** Create new movement record (start movement) */
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

    // Log initial location
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

  /** Update or complete movement */
  async updateMovement(movementId, employeeId, updateData) {
    const movement = await this.movementRepository.findById(movementId);
    
    if (!movement) throw new ApiError(404, MESSAGES.MOVEMENT.NOT_FOUND);
    if (movement.employee_id !== employeeId) throw new ApiError(403, MESSAGES.AUTH.ACCESS_DENIED);
    if (movement.status === 'completed') throw new ApiError(400, MESSAGES.MOVEMENT.ALREADY_COMPLETED);

    const allowedUpdates = ['return_time', 'status', 'latitude', 'longitude', 'address'];
    const filteredData = {};

    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) filteredData[field] = updateData[field];
    });

    // If completing movement, calculate duration and log final location
    if (filteredData.return_time && (filteredData.status === 'completed' || filteredData.status === 'ended')) {
      const startTime = new Date(movement.timestamp);
      const endTime = new Date(filteredData.return_time);
      const durationMs = endTime - startTime;
      const durationMinutes = Math.floor(durationMs / (1000 * 60));
      filteredData.actual_duration_minutes = durationMinutes;

      // Save final location to location table
      if (updateData.latitude && updateData.longitude) {
        await this.locationRepository.create({
          id: generateId(),
          employee_id: employeeId,
          timestamp: endTime.toISOString(),
          latitude: updateData.latitude,
          longitude: updateData.longitude,
          address: updateData.address || ''
        });
      }
    }

    const updatedMovement = await this.movementRepository.update(movementId, filteredData);
    return updatedMovement.toObject();
  }

  /** End (complete) movement explicitly — can be called from endMovement endpoint */
  async endMovement(movementId, employeeId, { latitude, longitude, address }) {
    const now = new Date();
    const updateData = {
      return_time: now.toISOString(),
      status: 'completed',
      latitude,
      longitude,
      address
    };
    return await this.updateMovement(movementId, employeeId, updateData);
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
    if (!movement) throw new ApiError(404, MESSAGES.MOVEMENT.NOT_FOUND);
    if (movement.employee_id !== employeeId) throw new ApiError(403, MESSAGES.AUTH.ACCESS_DENIED);
    return movement.toObject();
  }
}

module.exports = MovementService;
