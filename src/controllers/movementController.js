const MovementService = require('../services/movementService');
const { ApiResponse, asyncHandler } = require('../utils/response');

/**
 * MovementController
 * Handles all movement-related HTTP requests
 * All methods require authentication (enforced at route level)
 */
class MovementController {
  constructor() {
    this.movementService = new MovementService();
  }

  /**
   * Create a new movement record
   * POST /api/movements
   */
  createMovement = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    const movementData = { ...req.body, employeeId };

    const movement = await this.movementService.createMovement(movementData);

    res.status(201).json(
      ApiResponse.success(
        { movement },
        'Movement record created successfully',
        201
      )
    );
  });

  /**
   * Update movement
   * PUT /api/movements/:id
   */
  updateMovement = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const employeeId = req.user.employeeId;

    const movement = await this.movementService.updateMovement(id, employeeId, req.body);

    res.json(
      ApiResponse.success(
        { movement },
        'Movement record updated successfully'
      )
    );
  });

  /**
   * Complete movement
   * PATCH /api/movements/:id/end
   */
  completeMovement = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const employeeId = req.user.employeeId;
    const { return_time, status = 'completed' } = req.body;

    const movement = await this.movementService.updateMovement(id, employeeId, {
      return_time,
      status,
    });

    res.json(
      ApiResponse.success(
        { movement },
        'Movement completed successfully'
      )
    );
  });

  /**
   * End a movement
   * POST /api/movements/end
   * POST /api/movements/:id/end
   * Auto-detects active movement if movementId is not sent
   */
  endMovement = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    const { movementId, endLocation, endTime } = req.body;

    // Step 1: endTime is required
    if (!endTime) {
      return res.status(400).json(
        ApiResponse.error('Missing required field: endTime', 400)
      );
    }

    let movement;

    // Step 2: If movementId is provided → use it
    if (movementId) {
      try {
        movement = await this.movementService.getMovementById(
          movementId,
          employeeId
        );
      } catch (err) {
        return res.status(404).json(ApiResponse.error('Movement record not found', 404));
      }
    } else {
      // Step 3: Auto-detect active movement
      const activeMovements = await this.movementService.getActiveMovements(employeeId);
      movement = activeMovements[0];
    }

    // Step 4: If still no movement → return error
    if (!movement) {
      return res.status(404).json(
        ApiResponse.error('Movement record not found', 404)
      );
    }

    // Step 5: Update movement
    const updated = await this.movementService.updateMovement(movement._id, employeeId, {
      return_time: endTime,
      status: 'ended',
      latitude: endLocation.latitude,
      longitude: endLocation.longitude,
      address: endLocation.address,
    });

    res.json(
      ApiResponse.success(
        { movement: updated },
        'Movement ended successfully'
      )
    );
  });

  /**
   * Get movement history
   * GET /api/movements/history
   * GET /api/movements/history/current_user
   */
  getHistory = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    const result = await this.movementService.getMovementHistory(
      employeeId,
      { page: parseInt(page), limit: parseInt(limit), startDate, endDate }
    );

    res.json(
      ApiResponse.paginated(
        result.records,
        result.total,
        parseInt(page),
        parseInt(limit),
        'Movement history retrieved successfully'
      )
    );
  });

  /**
   * Get active movements
   * GET /api/movements/active
   */
  getActiveMovements = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    const movements = await this.movementService.getActiveMovements(employeeId);

    res.json(
      ApiResponse.success(
        { movements },
        'Active movements retrieved successfully'
      )
    );
  });

  /**
   * Get movement by ID
   * GET /api/movements/:id
   */
  getMovementById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const employeeId = req.user.employeeId;

    const movement = await this.movementService.getMovementById(id, employeeId);

    res.json(
      ApiResponse.success(
        { movement },
        'Movement retrieved successfully'
      )
    );
  });
}

module.exports = MovementController;
