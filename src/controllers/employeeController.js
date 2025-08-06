const EmployeeService = require('../services/employeeService');
const { ApiResponse, asyncHandler } = require('../utils/response');

class EmployeeController {
  constructor() {
    this.employeeService = new EmployeeService();
  }

  getEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const employee = await this.employeeService.getEmployeeById(id);
    
    res.json(
      ApiResponse.success(
        { employee },
        'Employee retrieved successfully'
      )
    );
  });

  updateEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const employee = await this.employeeService.updateEmployee(id, req.body);
    
    res.json(
      ApiResponse.success(
        { employee },
        'Employee updated successfully'
      )
    );
  });

  getAllEmployees = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;
    const options = { 
      page: parseInt(page), 
      limit: parseInt(limit),
      sortBy,
      sortOrder 
    };
    
    const result = await this.employeeService.getAllEmployees(options);
    
    res.json(
      ApiResponse.paginated(
        result.employees,
        result.total,
        result.page,
        result.limit,
        'Employees retrieved successfully'
      )
    );
  });

  getProfile = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    const employee = await this.employeeService.getEmployeeById(employeeId);
    
    res.json(
      ApiResponse.success(
        { employee },
        'Profile retrieved successfully'
      )
    );
  });

  updateProfile = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    const employee = await this.employeeService.updateEmployee(employeeId, req.body);
    
    res.json(
      ApiResponse.success(
        { employee },
        'Profile updated successfully'
      )
    );
  });
}

module.exports = EmployeeController;