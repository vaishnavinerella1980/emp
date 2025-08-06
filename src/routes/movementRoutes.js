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

router.put('/:id',
  movementController.updateMovement
);

// Movement history and status
router.get('/history',
  ValidationMiddleware.validatePagination,
  movementController.getHistory
);

router.get('/active', movementController.getActiveMovements);

module.exports = router;