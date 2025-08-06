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
}

module.exports = AuthController;