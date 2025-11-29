const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const { connectDatabase } = require('./config/database');
const { PORT, CORS_ORIGIN } = require('./config/environment');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const { notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const movementRoutes = require('./routes/movementRoutes');
const locationRoutes = require('./routes/locationRoutes');
const exportRoutes = require('./routes/exportRoutes');

/**
 * Main Application Class
 * Sets up Express server with middleware, routes, and error handling
 */
class Application {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Configure application middleware
   * - Security (Helmet)
   * - Compression
   * - Rate limiting
   * - CORS
   * - Body parsing
   */
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

  /**
   * Setup application routes
   * Main API routes:
   * - /api/auth - Authentication endpoints
   * - /api/employees - Employee management
   * - /api/attendance - Attendance tracking
   * - /api/movements - Movement tracking
   * - /api/location - Location validation
   * 
   * Legacy/Alias routes for backward compatibility:
   * - /api/validate-location
   * - /api/clock-in
   * - /api/clock-status
   */
  setupRoutes() {
    // Health check endpoints
    const healthResponse = {
      success: true,
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    };

    this.app.get('/health', (req, res) => {
      res.json(healthResponse);
    });

    this.app.get('/api/health', (req, res) => {
      res.json(healthResponse);
    });

    // API routes
    console.log('Registering auth routes...');
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/employees', employeeRoutes);
    this.app.use('/api/attendance', attendanceRoutes);
    this.app.use('/api/movements', movementRoutes);
    this.app.use('/api/location', locationRoutes);

    // Direct route aliases for backward compatibility with test files
    const LocationController = require('./controllers/locationController');
    const AttendanceController = require('./controllers/attendanceController');
    const AuthMiddleware = require('./middleware/auth');
    const ValidationMiddleware = require('./middleware/validation');
    
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

    // Direct clock-status endpoint (new endpoint)
    this.app.get('/api/clock-status',
      AuthMiddleware.authenticate,
      attendanceController.getClockStatus
    );
  }

  /**
   * Setup error handling middleware
   * - 404 Not Found handler
   * - Global error handler
   */
  setupErrorHandling() {
    this.app.use(notFound);
    this.app.use(errorHandler);
  }

  /**
   * Start the application server
   * - Connects to database
   * - Starts Express server on configured port
   */
  async start() {
    try {
      await connectDatabase();
      console.log('✅ Database connected successfully');

      this.app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${process.env.PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start application
if (require.main === module) {
  new Application().start();
}

module.exports = Application;