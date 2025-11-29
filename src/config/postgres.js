const { Sequelize } = require('sequelize');
require('dotenv').config();

class PostgreSQLDatabase {
  constructor() {
    const databaseUrl = 'postgresql://postgres:postgres@localhost:5432/employee_tracking';
    
    this.sequelize = new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: console.log,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true
      }
    });

    this.isConnected = false;
  }

  async connect() {
    try {
      console.log('🔗 Connecting to PostgreSQL...');
      await this.sequelize.authenticate();
      this.isConnected = true;
      console.log('✅ PostgreSQL connected');

      // Load models
      require('../models/sequelize/Employee');
      require('../models/sequelize/attendance');
      require('../models/sequelize/Movement');
      require('../models/sequelize/Location');
      require('../models/sequelize/Session');

      // Sync with alter to update tables
      console.log('🔄 Syncing database...');
      await this.sequelize.sync({ alter: true });
      console.log('✅ Database synced');

      // Add demo users
      await this.addDemoUsers();

    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async addDemoUsers() {
    try {
      console.log('👥 Adding demo users...');
      const Employee = require('../models/sequelize/Employee');
      const { generateId, hashPassword } = require('../utils/crypto');
      
      const demoUsers = [
        {
          id: generateId(),
          name: 'Super Admin',
          email: 'admin@acs.com',
          password: await hashPassword('123456'),
          phone: '+91-9876543210',
          department: 'IT',
          position: 'System Administrator',
          role: 'admin',
          office: 'ACS',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: generateId(),
          name: 'IOTIQ Admin',
          email: 'admin@iotiq.com',
          password: await hashPassword('123456'),
          phone: '+91-9876543212',
          department: 'IT',
          position: 'Administrator',
          role: 'admin',
          office: 'IOTIQ',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: generateId(),
          name: 'IT Manager ACS',
          email: 'it.manager@acs.com',
          password: await hashPassword('123456'),
          phone: '+91-9876543214',
          department: 'IT',
          position: 'IT Manager',
          role: 'manager',
          office: 'ACS',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: generateId(),
          name: 'HR Manager ACS',
          email: 'hr.manager@acs.com',
          password: await hashPassword('123456'),
          phone: '+91-9876543216',
          department: 'HR',
          position: 'HR Manager',
          role: 'manager',
          office: 'ACS',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      let addedCount = 0;
      for (const userData of demoUsers) {
        const existing = await Employee.findOne({ where: { email: userData.email } });
        if (!existing) {
          await Employee.create(userData);
          addedCount++;
          console.log(`✅ Added: ${userData.email}`);
        } else {
          console.log(`⚠️ Already exists: ${userData.email}`);
        }
      }

      console.log(`🎉 Added ${addedCount} demo users`);

    } catch (error) {
      console.error('Error adding demo users:', error);
    }
  }

  async disconnect() {
    try {
      await this.sequelize.close();
      this.isConnected = false;
      console.log('✅ PostgreSQL disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting:', error);
      throw error;
    }
  }

  getSequelize() {
    return this.sequelize;
  }
}

module.exports = new PostgreSQLDatabase();