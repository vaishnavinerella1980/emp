const { ApiResponse, asyncHandler } = require('../utils/response');
const AuthService = require('../services/authService');

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  register = asyncHandler(async (req, res) => {
    const { name, email, password, phone, department, position, address, emergency_contact } = req.body;

    const registrationData = {
      name,
      email,
      password,
      phone,
      department,
      position,
      address,
      emergency_contact
    };

    const employee = await this.authService.register(registrationData);

    res.status(201).json(
      ApiResponse.success(
        {
          employee,
          message: 'Employee registered successfully'
        },
        'Registration successful',
        201
      )
    );
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await this.authService.login(email, password);

    res.json(
      ApiResponse.success(
        {
          token: result.token,
          employee: result.employee,
          message: 'Login successful'
        },
        'Login successful'
      )
    );
  });

  logout = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      await this.authService.logout(token);
    }

    res.json(
      ApiResponse.success(
        { message: 'Logged out successfully' },
        'Logout successful'
      )
    );
  });

  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    // Fix: Get employeeId from req.user (set by auth middleware) and pass it to service
    const employeeId = req.user.employeeId;

    // Fix: Pass employeeId as first parameter
    await this.authService.changePassword(employeeId, currentPassword, newPassword);

    res.json(
      ApiResponse.success(
        { message: 'Password changed successfully' },
        'Password change successful'
      )
    );
  });
}

module.exports = AuthController;

//justtocommit