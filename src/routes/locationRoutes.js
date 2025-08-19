const express = require('express');
const LocationController = require('../controllers/locationController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();
const locationController = new LocationController();

// Apply authentication to all routes
router.use(AuthMiddleware.authenticate);

// Location operations
router.post('/update',
  ValidationMiddleware.validateLocation,
  locationController.updateLocation
);

router.post('/validate',
  ValidationMiddleware.validateLocation,
  locationController.validateLocation
);

// Location history
router.get('/history',
  ValidationMiddleware.validatePagination,
  locationController.getHistory
);

router.get('/current', locationController.getCurrentLocation);

module.exports = router;