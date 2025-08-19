const express = require('express');
const MovementController = require('../controllers/movementController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();
const movementController = new MovementController();

// Apply authentication to all routes
router.use(AuthMiddleware.authenticate);

// Movement operations
router.post('/',
  ValidationMiddleware.validateMovement,
  movementController.createMovement
);

// Movement history and status (specific routes must come before parameterized routes)
router.get('/history',
  ValidationMiddleware.validatePagination,
  movementController.getHistory
);

// Alternative endpoint for current user movement history
router.get('/history/current_user',
  ValidationMiddleware.validatePagination,
  movementController.getHistory
);

router.get('/active', movementController.getActiveMovements);

// Parameterized routes (must come after specific routes)
router.get('/:id', movementController.getMovementById);

router.put('/:id',
  movementController.updateMovement
);

module.exports = router;