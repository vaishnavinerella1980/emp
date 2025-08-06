const MovementService = require('../services/movementService');
const { ApiResponse, asyncHandler } = require('../utils/response');

class MovementController {
  constructor() {
    this.movementService = new MovementService();
  }

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
}

module.exports = MovementController;