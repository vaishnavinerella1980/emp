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
      timestamp,
      attendance_id 
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
      is_mock_location: is_mock_location || false,
      attendance_id: attendance_id || null // Link to specific attendance session
    };

    const record = await this.locationRepository.create(data);

    // Clean up old records to maintain performance
    await this.locationRepository.cleanupOldRecords(employeeId, 1000);

    return record.get ? record.get({ plain: true }) : record;
  }

  async getLocationHistory(employeeId, options = {}) {
    return await this.locationRepository.findByEmployeeId(employeeId, options);
  }

  async getCurrentLocation(employeeId) {
    const location = await this.locationRepository.findLatestLocation(employeeId);
    return location ? location.get({ plain: true }) : null;
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

  // 🆕 NEW METHOD: Get Movement Path for Map
  async getMovementPath(employeeId, startTime, endTime) {
    try {
      console.log(`📍 Generating path for employee ${employeeId} from ${startTime} to ${endTime}`);
      
      // Get all location points between start and end time
      const locationHistory = await this.locationRepository.findByEmployeeId(employeeId, {
        startDate: new Date(startTime),
        endDate: new Date(endDate),
        limit: 10000 // Get all points for the path
      });

      if (!locationHistory.updates || locationHistory.updates.length === 0) {
        return {
          employeeId: employeeId,
          startTime: startTime,
          endTime: endTime,
          points: [],
          totalPoints: 0,
          bounds: null,
          message: 'No location data found for the specified time period'
        };
      }

      // Format for map (your UI probably expects this format)
      const path = {
        employeeId: employeeId,
        startTime: startTime,
        endTime: endTime,
        points: locationHistory.updates.map(loc => ({
          id: loc.id,
          timestamp: loc.timestamp,
          latitude: loc.latitude,
          longitude: loc.longitude,
          address: loc.address,
          accuracy: loc.accuracy,
          battery_level: loc.battery_level,
          is_mock_location: loc.is_mock_location
        })),
        totalPoints: locationHistory.updates.length,
        bounds: this.calculatePathBounds(locationHistory.updates),
        totalDistance: this.calculateTotalDistance(locationHistory.updates)
      };

      console.log(`✅ Generated path with ${path.totalPoints} points`);
      return path;
    } catch (error) {
      console.error('❌ Error generating path:', error);
      throw error;
    }
  }

  // 🆕 NEW METHOD: Calculate map boundaries
  calculatePathBounds(locations) {
    if (!locations || locations.length === 0) {
      return null;
    }

    let minLat = locations[0].latitude;
    let maxLat = locations[0].latitude;
    let minLng = locations[0].longitude;
    let maxLng = locations[0].longitude;

    locations.forEach(loc => {
      minLat = Math.min(minLat, loc.latitude);
      maxLat = Math.max(maxLat, loc.latitude);
      minLng = Math.min(minLng, loc.longitude);
      maxLng = Math.max(maxLng, loc.longitude);
    });

    return {
      minLat: parseFloat(minLat.toFixed(6)),
      maxLat: parseFloat(maxLat.toFixed(6)),
      minLng: parseFloat(minLng.toFixed(6)),
      maxLng: parseFloat(maxLng.toFixed(6)),
      center: {
        lat: parseFloat(((minLat + maxLat) / 2).toFixed(6)),
        lng: parseFloat(((minLng + maxLng) / 2).toFixed(6))
      }
    };
  }

  // 🆕 NEW METHOD: Calculate total distance traveled
  calculateTotalDistance(locations) {
    if (!locations || locations.length < 2) {
      return 0;
    }

    let totalDistance = 0;
    for (let i = 1; i < locations.length; i++) {
      const prevLoc = locations[i - 1];
      const currLoc = locations[i];
      
      const distance = LocationUtils.calculateDistance(
        prevLoc.latitude,
        prevLoc.longitude,
        currLoc.latitude,
        currLoc.longitude
      );
      
      totalDistance += distance;
    }

    return parseFloat(totalDistance.toFixed(2)); // Return in meters
  }

  // 🆕 NEW METHOD: Get locations by attendance session
  async getAttendanceLocations(attendanceId) {
    try {
      console.log(`📍 Getting locations for attendance: ${attendanceId}`);
      
      // This would query locations linked to a specific attendance session
      // For now, we'll return all locations for the employee during attendance period
      // You can enhance this later to use the attendance_id field
      
      const locations = await this.locationRepository.findByAttendanceId(attendanceId);
      return locations ? locations.map(loc => loc.get({ plain: true })) : [];
      
    } catch (error) {
      console.error('❌ Error getting attendance locations:', error);
      throw error;
    }
  }

  // 🆕 NEW METHOD: Get location density (for optimizing map rendering)
  async getOptimizedPath(employeeId, startTime, endTime, maxPoints = 100) {
    try {
      console.log(`📍 Generating optimized path with max ${maxPoints} points`);
      
      const fullPath = await this.getMovementPath(employeeId, startTime, endTime);
      
      if (fullPath.points.length <= maxPoints) {
        return fullPath; // No optimization needed
      }

      // Simple optimization: take evenly spaced points
      const optimizedPoints = [];
      const step = Math.floor(fullPath.points.length / maxPoints);
      
      for (let i = 0; i < fullPath.points.length; i += step) {
        optimizedPoints.push(fullPath.points[i]);
        
        if (optimizedPoints.length >= maxPoints) {
          break;
        }
      }

      // Always include first and last points
      if (!optimizedPoints.includes(fullPath.points[0])) {
        optimizedPoints.unshift(fullPath.points[0]);
      }
      if (!optimizedPoints.includes(fullPath.points[fullPath.points.length - 1])) {
        optimizedPoints.push(fullPath.points[fullPath.points.length - 1]);
      }

      return {
        ...fullPath,
        points: optimizedPoints,
        totalPoints: optimizedPoints.length,
        optimized: true,
        originalPoints: fullPath.points.length
      };

    } catch (error) {
      console.error('❌ Error generating optimized path:', error);
      throw error;
    }
  }
}

module.exports = LocationService;