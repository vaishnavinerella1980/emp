const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/environment');
const EmployeeRepository = require('../repositories/employeeRepository');
const SessionRepository = require('../repositories/sessionsRepository');
const { ApiError } = require('../middleware/errorHandler');
const { generateId, hashPassword, comparePassword } = require('../utils/crypto');
const { MESSAGES } = require('../constants/messages');

class AuthService {
  constructor() {
    this.employeeRepository = new EmployeeRepository();
    this.sessionRepository = new SessionRepository();
  }

  async register(registrationData) {
    const { name, email, password, phone, department, position, address, emergency_contact } = registrationData;

    // Check if employee already exists
    const existingEmployee = await this.employeeRepository.findByEmail(email);
    if (existingEmployee) {
      throw new ApiError(409, MESSAGES.AUTH.EMAIL_EXISTS);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create employee
    const employeeData = {
      id: generateId(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      department: department || '',
      position: position || '',
      address: address || '',
      emergency_contact: emergency_contact || '',
      profile_image: '',
      role: 'employee',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const employee = await this.employeeRepository.create(employeeData);
    return this.sanitizeEmployee(employee.toObject());
  }

  async login(email, password) {
    // Find employee
    const employee = await this.employeeRepository.findByEmail(email);
    if (!employee) {
      throw new ApiError(401, MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, employee.password);
    if (!isPasswordValid) {
      throw new ApiError(401, MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    // Generate token
    const token = jwt.sign(
      { employeeId: employee.id, email: employee.email, role: employee.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Save session
    await this.sessionRepository.create({
      employee_id: employee.id,
      token,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    return {
      token,
      employee: this.sanitizeEmployee(employee.toObject())
    };
  }

  async logout(token) {
    await this.sessionRepository.deleteByToken(token);
  }

  sanitizeEmployee(employee) {
    const { password, ...sanitized } = employee;
    return sanitized;
  }
}

module.exports = AuthService;