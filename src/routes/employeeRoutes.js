const express = require('express');
const EmployeeController = require('../controllers/employeeController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();
const employeeController = new EmployeeController();

// Apply authentication to all routes
router.use(AuthMiddleware.authenticate);

// Profile routes
router.get('/profile', employeeController.getProfile);
router.put(
  '/profile',
  ValidationMiddleware.validateUpdateEmployee,
  employeeController.updateProfile
);
router.patch(
  '/profile/password',
  ValidationMiddleware.validateChangePassword,
  employeeController.changePassword
);

// Employee management routes (could be restricted to admin/manager roles)
router.get('/', 
  ValidationMiddleware.validatePagination,
  employeeController.getAllEmployees
);

router.get('/:id',
  ValidationMiddleware.validateEmployeeId,
  employeeController.getEmployee
);

router.put('/:id',
  ValidationMiddleware.validateEmployeeId,
  AuthMiddleware.checkOwnership,
  ValidationMiddleware.validateUpdateEmployee,
  employeeController.updateEmployee
);

module.exports = router;