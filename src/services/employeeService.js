const EmployeeRepository = require('../repositories/employeeRepository');
const { ApiError } = require('../middleware/errorHandler');
const { MESSAGES } = require('../constants/messages');
const { comparePassword, hashPassword } = require('../utils/crypto');

class EmployeeService {
  constructor() {
    this.employeeRepository = new EmployeeRepository();
  }

  async getEmployeeById(id) {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new ApiError(404, MESSAGES.EMPLOYEE.NOT_FOUND);
    }
    return this.sanitizeEmployee(employee.get({ plain: true }));
  }

  async updateEmployee(id, updateData) {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new ApiError(404, MESSAGES.EMPLOYEE.NOT_FOUND);
    }

    const allowedUpdates = ['name', 'phone', 'department', 'position', 'address', 'emergency_contact', 'profile_image'];
    const filteredData = {};
    
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field].toString().trim();
      }
    });

    const updatedEmployee = await this.employeeRepository.update(id, filteredData);
    return this.sanitizeEmployee(updatedEmployee.get({ plain: true }));
  }

  async changePassword(id, currentPassword, newPassword) {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new ApiError(404, MESSAGES.EMPLOYEE.NOT_FOUND);
    }

    const isCurrentValid = await comparePassword(currentPassword, employee.password);
    if (!isCurrentValid) {
      throw new ApiError(400, MESSAGES.AUTH.INVALID_CURRENT_PASSWORD);
    }

    const hashed = await hashPassword(newPassword);
    await this.employeeRepository.updatePassword(id, hashed);
    return true;
  }

  async getAllEmployees(options = {}) {
    const result = await this.employeeRepository.findAll({}, options);
    return {
      data: result.data.map(emp => this.sanitizeEmployee(emp.get({ plain: true }))),
      pagination: result.pagination
    };
  }

  sanitizeEmployee(employee) {
    const { password, ...sanitized } = employee;
    return sanitized;
  }
}

module.exports = EmployeeService;