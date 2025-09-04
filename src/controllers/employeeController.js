const { ApiResponse, asyncHandler } = require('../utils/response');
const EmployeeService = require('../services/employeeService');
const { MESSAGES } = require('../constants/messages');

class EmployeeController {
  constructor() {
    this.employeeService = new EmployeeService();
  }

  // Get current user's profile (requires authentication)
  getProfile = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    const employee = await this.employeeService.getEmployeeById(employeeId);
    res.json(ApiResponse.success(employee, 'Profile fetched successfully'));
  });

  // Update current user's profile (requires authentication)
  updateProfile = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    const updateData = req.validatedData || req.body; // prefer validated data if present
    const updated = await this.employeeService.updateEmployee(employeeId, updateData);
    res.json(ApiResponse.success(updated, MESSAGES.EMPLOYEE.UPDATED));
  });

  // The following endpoints now use the service layer
  getAllEmployees = asyncHandler(async (req, res) => {
    // Optional: implement later if needed
    res.json(ApiResponse.success({ message: 'Employees listing to be implemented' }));
  });

  getEmployee = asyncHandler(async (req, res) => {
    const employeeId = req.params.id;
    const employee = await this.employeeService.getEmployeeById(employeeId);
    res.json(ApiResponse.success(employee, 'Employee fetched successfully'));
  });

  updateEmployee = asyncHandler(async (req, res) => {
    const employeeId = req.params.id;
    const updateData = req.validatedData || req.body;
    const updated = await this.employeeService.updateEmployee(employeeId, updateData);
    res.json(ApiResponse.success(updated, MESSAGES.EMPLOYEE.UPDATED));
  });

  changePassword = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    const { currentPassword, newPassword } = req.body;
    await this.employeeService.changePassword(employeeId, currentPassword, newPassword);
    res.json(ApiResponse.success({ message: MESSAGES.AUTH.PASSWORD_CHANGED }));
  });
}

module.exports = EmployeeController;