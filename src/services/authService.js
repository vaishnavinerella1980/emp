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

    console.log('=== REGISTRATION DEBUG START ===');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('Name:', name);
    
    // Check if employee already exists
    const existingEmployee = await this.employeeRepository.findByEmail(email);
    console.log('Existing employee found:', !!existingEmployee);
    
    if (existingEmployee) {
      throw new ApiError(409, MESSAGES.AUTH.EMAIL_EXISTS);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    console.log('Password hashed successfully. Hash length:', hashedPassword.length);
    console.log('Hash starts with:', hashedPassword.substring(0, 10));

    // Create employee
    let employeeId;
    do {
      employeeId = generateId(); // Generate a new employee ID
      console.log('Generated employee ID:', employeeId); // Debugging log
      const existingEmployee = await this.employeeRepository.findById(employeeId);
      if (existingEmployee) {
        console.log('Duplicate employee ID found, generating a new one...');
      }
    } while (existingEmployee);
    console.log('Generated employee ID:', employeeId); // Debugging log
    console.log('Generated employee ID:', employeeId); // Debugging log
    console.log('Generated employee ID:', employeeId); // Debugging log
    const employeeData = {
      id: employeeId,
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

    console.log('Creating employee with email:', employeeData.email);
    const employee = await this.employeeRepository.create(employeeData);
    console.log('Employee created successfully with ID:', employee.id); // Debugging log
    console.log('Registered employee data:', employeeData); // Log the employee data
    console.log('Registered employee data:', employeeData); // Log the employee data
    console.log('=== REGISTRATION DEBUG END ===');
    
    return this.sanitizeEmployee(employee.toObject());
  }

  async login(email, password) {
    console.log('=== LOGIN DEBUG START ===');
    console.log('Login attempt with email:', email);
    console.log('Password length:', password.length);
    console.log('Trimmed email:', email.toLowerCase().trim());

    // Find employee
    const employee = await this.employeeRepository.findByEmail(email);
    console.log('Employee found:', !!employee);
    
    if (!employee) {
      console.log('ERROR: No employee found with email:', email);
      throw new ApiError(401, MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    console.log('Found employee:', {
      id: employee.id,
      email: employee.email,
      hasPassword: !!employee.password,
      passwordLength: employee.password ? employee.password.length : 0,
      passwordStart: employee.password ? employee.password.substring(0, 10) : 'N/A'
    });

    // Verify password
    console.log('Comparing password...');
    console.log('Input password:', password);
    console.log('Stored password hash starts with:', employee.password.substring(0, 10));
    
    const isPasswordValid = await comparePassword(password, employee.password);
    console.log('Password comparison result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('ERROR: Password comparison failed');
      console.log('Input password length:', password.length);
      console.log('Stored hash length:', employee.password.length);
      throw new ApiError(401, MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    console.log('Password validation successful');

    // Generate token
    const token = jwt.sign(
      { employeeId: employee.id, email: employee.email, role: employee.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log('JWT token generated successfully');

    // Save session
    await this.sessionRepository.create({
      employee_id: employee.id,
      token,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    console.log('Session saved successfully');
    console.log('=== LOGIN DEBUG END ===');

    return {
      token,
      employee: this.sanitizeEmployee(employee.toObject())
    };
  }

  async logout(token) {
    await this.sessionRepository.deleteByToken(token);
  }

  async changePassword(employeeId, currentPassword, newPassword) {
    console.log('=== CHANGE PASSWORD DEBUG START ===');
    console.log('Employee ID:', employeeId);
    console.log('Current password length:', currentPassword.length);
    console.log('New password length:', newPassword.length);

    // Find employee
    const employee = await this.employeeRepository.findById(employeeId);
    console.log('Employee found:', !!employee);
    
    if (!employee) {
      console.log('ERROR: Employee not found');
      throw new ApiError(404, MESSAGES.AUTH.EMPLOYEE_NOT_FOUND);
    }

    console.log('Found employee:', {
      id: employee.id,
      email: employee.email,
      hasPassword: !!employee.password,
      passwordLength: employee.password ? employee.password.length : 0,
      passwordStart: employee.password ? employee.password.substring(0, 10) : 'N/A'
    });

    // Verify current password
    console.log('Verifying current password...');
    console.log('Input current password:', currentPassword);
    console.log('Stored password hash starts with:', employee.password.substring(0, 10));
    
    const isCurrentPasswordValid = await comparePassword(currentPassword, employee.password);
    console.log('Current password validation result:', isCurrentPasswordValid);
    
    if (!isCurrentPasswordValid) {
      console.log('ERROR: Current password is incorrect');
      console.log('Input current password length:', currentPassword.length);
      console.log('Stored hash length:', employee.password.length);
      throw new ApiError(401, MESSAGES.AUTH.INVALID_CURRENT_PASSWORD);
    }

    console.log('Current password validation successful');

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);
    console.log('New password hashed successfully. Hash length:', hashedNewPassword.length);
    console.log('New hash starts with:', hashedNewPassword.substring(0, 10));

    // Update password
    await this.employeeRepository.updatePassword(employeeId, hashedNewPassword);
    console.log('Password updated successfully in database');

    console.log('=== CHANGE PASSWORD DEBUG END ===');
  }

  sanitizeEmployee(employee) {
    const { password, ...sanitized } = employee;
    return sanitized;
  }
}

module.exports = AuthService;