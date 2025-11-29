const express = require('express');
const TimingReportController = require('../controllers/timingReportController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();
const timingReportController = new TimingReportController();

// All timing report routes require authentication
router.use(AuthMiddleware.authenticate);

// Get timing reports with filters
router.get('/reports', timingReportController.getTimingReports);

// Get dashboard stats
router.get('/dashboard', timingReportController.getDashboardStats);

// Get employee movement path
router.get('/movement-path', timingReportController.getMovementPath);

module.exports = router;