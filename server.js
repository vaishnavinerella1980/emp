const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Import configurations
const { connectDatabase } = require('./src/config/database');
const { PORT, CORS_ORIGIN } = require('./src/config/environment');

// Import middleware
const rateLimiter = require('./src/middleware/rateLimiter');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const employeeRoutes = require('./src/routes/employeeRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const movementRoutes = require('./src/routes/movementRoutes');
const locationRoutes = require('./src/routes/locationRoutes');

class Application {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(compression());
    
    // Rate limiting
    this.app.use(rateLimiter);

    // CORS configuration
    this.app.use(cors({
      origin: CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // TEMPORARY TEST ROUTE - Remove later
    this.app.get('/test-db', async (req, res) => {
      try {
        const Employee = require('./src/models/sequelize/Employee');
        const employeeCount = await Employee.count();
        res.json({
          success: true,
          message: 'Database connection test',
          employeeCount: employeeCount,
          database: 'PostgreSQL'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Database test failed',
          error: error.message
        });
      }
    });

    // Database viewer
    this.app.get('/api/db/tables', async (req, res) => {
      try {
        const { sequelize } = require('./src/config/database');
        const tables = await sequelize.query(`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public' ORDER BY table_name;
        `, { type: sequelize.QueryTypes.SELECT });
        res.json({
          success: true,
          tables: tables.map(t => t.table_name),
          message: `Found ${tables.length} tables`
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error fetching tables',
          error: error.message
        });
      }
    });

    this.app.get('/api/db/table/:tableName', async (req, res) => {
      try {
        const { sequelize } = require('./src/config/database');
        const { tableName } = req.params;
        const columns = await sequelize.query(`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = '${tableName}' ORDER BY ordinal_position;
        `, { type: sequelize.QueryTypes.SELECT });
        const rowCount = await sequelize.query(
          `SELECT COUNT(*) as count FROM ${tableName}`,
          { type: sequelize.QueryTypes.SELECT }
        );
        const sampleData = await sequelize.query(
          `SELECT * FROM ${tableName} LIMIT 5`,
          { type: sequelize.QueryTypes.SELECT }
        );
        res.json({
          success: true,
          table: tableName,
          columns: columns,
          rowCount: rowCount[0].count,
          sampleData: sampleData
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error fetching table data',
          error: error.message
        });
      }
    });

    this.app.get('/api/db/table/:tableName/all', async (req, res) => {
      try {
        const { sequelize } = require('./src/config/database');
        const { tableName } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        const countResult = await sequelize.query(
          `SELECT COUNT(*) as count FROM ${tableName}`,
          { type: sequelize.QueryTypes.SELECT }
        );
        const data = await sequelize.query(
          `SELECT * FROM ${tableName} ORDER BY id LIMIT ${limit} OFFSET ${offset}`,
          { type: sequelize.QueryTypes.SELECT }
        );
        res.json({
          success: true,
          table: tableName,
          data: data,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: parseInt(countResult[0].count),
            totalPages: Math.ceil(countResult[0].count / limit)
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error fetching table data',
          error: error.message
        });
      }
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/employees', employeeRoutes);
    this.app.use('/api/attendance', attendanceRoutes);
    this.app.use('/api/movements', movementRoutes);
    this.app.use('/api/location', locationRoutes);

    // Direct route aliases for backward compatibility with test files
    const LocationController = require('./src/controllers/locationController');
    const AttendanceController = require('./src/controllers/attendanceController');
    const AuthMiddleware = require('./src/middleware/auth');
    const ValidationMiddleware = require('./src/middleware/validation');
    
    const locationController = new LocationController();
    const attendanceController = new AttendanceController();

    // Direct validate-location endpoint (alias for /api/location/validate)
    this.app.post('/api/validate-location',
      AuthMiddleware.authenticate,
      ValidationMiddleware.validateLocation,
      locationController.validateLocation
    );

    // Direct clock-in endpoint (alias for /api/attendance/clock-in)
    this.app.post('/api/clock-in',
      AuthMiddleware.authenticate,
      ValidationMiddleware.validateClockIn,
      attendanceController.clockIn
    );

    // Direct clock-out endpoint (alias for /api/attendance/clock-out)
    this.app.post('/api/clock-out',
      AuthMiddleware.authenticate,
      ValidationMiddleware.validateClockOut,
      attendanceController.clockOut
    );

    // Direct clock-status endpoint (new endpoint)
    this.app.get('/api/clock-status',
      AuthMiddleware.authenticate,
      attendanceController.getClockStatus
    );

    // ==================== ENHANCED TIMING ENDPOINTS ====================

    // Real-time dashboard with actual data
    this.app.get('/api/timing/dashboard', AuthMiddleware.authenticate, async (req, res) => {
      try {
        const { sequelize } = require('./src/config/database');
        
        // Get real counts from database
        const today = new Date().toISOString().split('T')[0];
        
        // Count clocked-in employees (active attendances)
        const clockedInResult = await sequelize.query(
          "SELECT COUNT(*) as count FROM attendances WHERE is_active = true AND date = $1",
          { 
            bind: [today],
            type: sequelize.QueryTypes.SELECT 
          }
        );
        
        // Count clocked-out employees (completed attendances today)
        const clockedOutResult = await sequelize.query(
          "SELECT COUNT(*) as count FROM attendances WHERE status = 'completed' AND date = $1",
          { 
            bind: [today],
            type: sequelize.QueryTypes.SELECT 
          }
        );
        
        // Total employees
        const totalEmployeesResult = await sequelize.query(
          "SELECT COUNT(*) as count FROM employees WHERE is_active = true",
          { type: sequelize.QueryTypes.SELECT }
        );

        res.json({
          success: true,
          data: {
            today: today,
            clockedInCount: parseInt(clockedInResult[0].count),
            clockedOutCount: parseInt(clockedOutResult[0].count),
            totalEmployees: parseInt(totalEmployeesResult[0].count),
            message: 'Real-time dashboard data'
          },
          message: 'Dashboard stats retrieved successfully'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error getting dashboard stats',
          error: error.message
        });
      }
    });

    // Timing reports with real data and filters
    this.app.get('/api/timing/reports', AuthMiddleware.authenticate, async (req, res) => {
      try {
        const { sequelize } = require('./src/config/database');
        const { startDate, endDate, department, office } = req.query;
        
        let whereClause = "WHERE 1=1";
        const params = [];
        
        if (startDate) {
          params.push(startDate);
          whereClause += ` AND date >= $${params.length}`;
        }
        
        if (endDate) {
          params.push(endDate);
          whereClause += ` AND date <= $${params.length}`;
        }
        
        if (department) {
          params.push(department);
          whereClause += ` AND department = $${params.length}`;
        }
        
        if (office) {
          params.push(office);
          whereClause += ` AND office = $${params.length}`;
        }

        const reports = await sequelize.query(
          `SELECT * FROM attendances ${whereClause} ORDER BY created_at DESC LIMIT 50`,
          { 
            bind: params,
            type: sequelize.QueryTypes.SELECT 
          }
        );

        res.json({
          success: true,
          data: {
            reports: reports,
            total: reports.length,
            filters: { startDate, endDate, department, office }
          },
          message: 'Timing reports retrieved successfully'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error getting timing reports',
          error: error.message
        });
      }
    });

    // Excel export endpoint
    this.app.get('/api/timing/export', AuthMiddleware.authenticate, async (req, res) => {
      try {
        const { startDate, endDate, department, office } = req.query;
        
        // Set headers for Excel file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=attendance-report-${new Date().toISOString().split('T')[0]}.xlsx`);
        
        // For now, return JSON (frontend can convert to Excel)
        // In production, use exceljs library to create actual Excel files
        res.json({
          success: true,
          message: 'Excel export endpoint ready - frontend can implement download',
          data: {
            format: 'excel',
            filters: { startDate, endDate, department, office },
            downloadUrl: '/api/timing/export' // Frontend can use this to trigger download
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error generating export',
          error: error.message
        });
      }
    });

    // Employee movement path
    this.app.get('/api/timing/movement-path', AuthMiddleware.authenticate, async (req, res) => {
      try {
        const { sequelize } = require('./src/config/database');
        const { employeeId, date } = req.query;
        const requestingEmployeeId = req.user.employeeId;
        const role = req.user.role;

        // Authorization check
        if (role === 'employee' && employeeId !== requestingEmployeeId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. Employees can only view their own data.'
          });
        }

        let whereClause = "WHERE 1=1";
        const params = [];

        if (employeeId) {
          params.push(employeeId);
          whereClause += ` AND employee_id = $${params.length}`;
        }

        if (date) {
          params.push(date);
          whereClause += ` AND DATE(timestamp) = $${params.length}`;
        }

        const movementPath = await sequelize.query(
          `SELECT employee_id, latitude, longitude, timestamp, reason, address 
           FROM movements ${whereClause} ORDER BY timestamp ASC`,
          { 
            bind: params,
            type: sequelize.QueryTypes.SELECT 
          }
        );

        res.json({
          success: true,
          data: {
            movementPath: movementPath,
            totalPoints: movementPath.length
          },
          message: 'Movement path retrieved successfully'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error getting movement path',
          error: error.message
        });
      }
    });
  }

  setupErrorHandling() {
    this.app.use(notFound);
    this.app.use(errorHandler);
  }

  async start() {
    try {
      await connectDatabase();
      console.log('✅ Database connected successfully');

      this.app.listen(PORT, '0.0.0.0', () => {
        console.log('🎉 ================================');
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 API: http://localhost:${PORT}/api`);
        console.log(`🏥 Health: http://localhost:${PORT}/health`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('📦 PostgreSQL connected and ready');
        console.log('🎉 ================================');
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start application
const application = new Application();
application.start();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  try {
    const { closeDatabase } = require('./src/config/database');
    await closeDatabase();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});