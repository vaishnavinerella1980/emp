const LocationRepository = require('../repositories/locationRepository');
const { generateId } = require('../utils/crypto');
const LocationUtils = require('../utils/location');
const { OFFICE_LATITUDE, OFFICE_LONGITUDE, OFFICE_RADIUS } = require('../config/environment');

class LocationService {
  constructor() {
    this.locationRepository = new LocationRepository();
  }

  async updateLocation(locationData) {
    const { 
      employeeId, 
      latitude, 
      longitude, 
      accuracy, 
      heading, 
      speed, 
      address, 
      battery_level, 
      is_mock_location,
      timestamp 
    } = locationData;

    const updateTime = timestamp ? new Date(timestamp) : new Date();

    const data = {
      id: generateId(),
      employee_id: employeeId,
      timestamp: updateTime.toISOString(),
      latitude,
      longitude,
      accuracy: accuracy || null,
      heading: heading || null,
      speed: speed || null,
      address: address || '',
      battery_level: battery_level || null,
      is_mock_location: is_mock_location || false
    };

    const record = await this.locationRepository.create(data);

    // Clean up old records to maintain performance
    await this.locationRepository.cleanupOldRecords(employeeId, 1000);

    return record.toObject();
  }

  async getLocationHistory(employeeId, options = {}) {
    return await this.locationRepository.findByEmployeeId(employeeId, options);
  }

  async getCurrentLocation(employeeId) {
    const location = await this.locationRepository.findLatestLocation(employeeId);
    return location ? location.toObject() : null;
  }

  async validateLocation(latitude, longitude) {
    const officeValidation = LocationUtils.validateOfficeLocation(latitude, longitude, {
      latitude: OFFICE_LATITUDE,
      longitude: OFFICE_LONGITUDE,
      radius: OFFICE_RADIUS
    });

    return {
      location_valid: true,
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      office_validation: officeValidation,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = LocationService;