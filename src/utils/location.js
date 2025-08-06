class LocationUtils {
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  static isWithinRadius(centerLat, centerLon, pointLat, pointLon, radius) {
    const distance = this.calculateDistance(centerLat, centerLon, pointLat, pointLon);
    return distance <= radius;
  }

  static validateOfficeLocation(latitude, longitude, officeConfig) {
    if (!officeConfig.latitude || !officeConfig.longitude) {
      return {
        isValid: true,
        isWithinRadius: true,
        distance: 0,
        message: 'Office location validation disabled'
      };
    }

    const distance = this.calculateDistance(
      latitude,
      longitude,
      officeConfig.latitude,
      officeConfig.longitude
    );

    const isWithinRadius = distance <= officeConfig.radius;

    return {
      isValid: true,
      isWithinRadius,
      distance: Math.round(distance),
      message: isWithinRadius 
        ? 'Location is within office radius' 
        : `Location is ${Math.round(distance)}m from office (max: ${officeConfig.radius}m)`
    };
  }
}

module.exports = LocationUtils;