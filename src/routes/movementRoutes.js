const express = require('express');
const MovementController = require('../controllers/movementController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();
const movementController = new MovementController();

// Apply authentication to ALL movement routes
router.use(AuthMiddleware.authenticate);

/**
 * CREATE MOVEMENT
 * POST /api/movements
 */
router.post(
  '/',
  ValidationMiddleware.validateMovement,
  movementController.createMovement
);

/**
 * END MOVEMENT BY ID
 * POST /api/movements/:id/end
 * Accepts body: { endTime, endLocation }
 * (movementId NOT needed, controller auto-detects)
 */
router.post('/:id/end', movementController.endMovement);

/**
 * END ACTIVE MOVEMENT (AUTO-DETECT)
 * POST /api/movements/end
 * Accepts body: { endTime, endLocation }
 */
router.post('/end', movementController.endMovement);

/**
 * MOVEMENT HISTORY (Paginated)
 * GET /api/movements/history
 */
router.get(
  '/history',
  ValidationMiddleware.validatePagination,
  movementController.getHistory
);

/**
 * CURRENT USER MOVEMENT HISTORY
 * GET /api/movements/history/current_user
 */
router.get(
  '/history/current_user',
  ValidationMiddleware.validatePagination,
  movementController.getHistory
);

/**
 * ACTIVE MOVEMENTS
 * GET /api/movements/active
 */
router.get('/active', movementController.getActiveMovements);

/**
 * GET MOVEMENT BY ID
 * GET /api/movements/:id
 */
router.get('/:id', movementController.getMovementById);

/**
 * COMPLETE MOVEMENT
 * PATCH /api/movements/:id/end
 */
router.patch(
  '/:id/end',
  ValidationMiddleware.validateMovementCompletion,
  movementController.completeMovement
);

/**
 * UPDATE MOVEMENT
 * PUT /api/movements/:id
 */
router.put('/:id', movementController.updateMovement);

module.exports = router;
