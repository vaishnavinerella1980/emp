const express = require('express');
const ExportController = require('../controllers/exportController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();
const exportController = new ExportController();

// All export routes require authentication
router.use(AuthMiddleware.authenticate);

// Export attendance data to Excel
router.get('/attendance', exportController.exportAttendance);

// Export movement data to Excel
router.get('/movements', exportController.exportMovements);

module.exports = router;