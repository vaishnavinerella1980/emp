const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

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

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/employees', employeeRoutes);
    this.app.use('/api/attendance', attendanceRoutes);
    this.app.use('/api/movements', movementRoutes);
    this.app.use('/api/location', locationRoutes);
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
        console.log(`🚀 Server running on port ${process.env.PORT}`);
        console.log(`📡 API: http://localhost:${process.env.PORT}/api`);
        console.log(`🏥 Health: http://localhost:${process.env.PORT}/health`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('📦 MongoDB connected and ready');
        console.log('🎉 ================================');
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start application
const app = new Application();
app.start();

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
