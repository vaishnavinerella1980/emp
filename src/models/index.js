const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Attendance = require('./Attendance')(sequelize, Sequelize.DataTypes);
db.Employee = require('./Employee')(sequelize, Sequelize.DataTypes);
db.Movement = require('./Movement')(sequelize, Sequelize.DataTypes);
db.Location = require('./Location')(sequelize, Sequelize.DataTypes);
db.OfficeLocation = require('./OfficeLocation')(sequelize, Sequelize.DataTypes);
db.Session = require('./Session')(sequelize, Sequelize.DataTypes);
db.TimingReport = require('./TimingReport')(sequelize, Sequelize.DataTypes);

// Associations can be defined here if needed

module.exports = db;