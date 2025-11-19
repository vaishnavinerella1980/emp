const LocationService = require('../services/locationService');
const { ApiResponse, asyncHandler } = require('../utils/response');

class LocationController {
  constructor() {
    this.locationService = new LocationService();
  }

  updateLocation = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    const locationData = { ...req.body, employeeId };
    
    const location = await this.locationService.updateLocation(locationData);
    
    res.json(
      ApiResponse.success(
        { location },
        'Location updated successfully'
      )
    );
  });

  getHistory = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    const { page = 1, limit = 100, startDate, endDate } = req.query;

    const result = await this.locationService.getLocationHistory(
      employeeId,
      { page: parseInt(page), limit: parseInt(limit), startDate, endDate }
    );

    res.json(
      ApiResponse.paginated(
        result.updates,
        result.total,
        parseInt(page),
        parseInt(limit),
        'Location history retrieved successfully'
      )
    );
  });

  getCurrentLocation = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    const location = await this.locationService.getCurrentLocation(employeeId);
    
    res.json(
      ApiResponse.success(
        { location },
        location ? 'Current location retrieved successfully' : 'No location data found'
      )
    );
  });

  validateLocation = asyncHandler(async (req, res) => {
    const { latitude, longitude } = req.body;
    const validation = await this.locationService.validateLocation(latitude, longitude);
    
    res.json(
      ApiResponse.success(
        validation,
        'Location validated successfully'
      )
    );
  });
}

module.exports = LocationController;