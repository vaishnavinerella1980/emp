const express = require('express');
const AuthController = require('../controllers/authController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();
const authController = new AuthController();

// Public routes
router.post('/register', 
  ValidationMiddleware.validateRegistration,
  authController.register
);

router.post('/login',
  ValidationMiddleware.validateLogin,
  authController.login
);

// Protected routes
router.post('/logout',
  AuthMiddleware.authenticate,
  authController.logout
);

// Fix: Remove :employeeId parameter since we get it from the token
router.post('/change-password',
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateChangePassword, // Add validation if not present
  authController.changePassword
);

module.exports = router;
