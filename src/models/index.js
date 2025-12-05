const { Sequelize } = require('sequelize');
const postgres = require('../config/postgres');

const sequelize = postgres.getSequelize();

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models from sequelize subdirectory
db.Attendance = require('./sequelize/attendance');
db.Employee = require('./sequelize/Employee');
db.Movement = require('./sequelize/Movement');
db.Location = require('./sequelize/Location');
db.OfficeLocation = require('./sequelize/OfficeLocation');
db.Session = require('./sequelize/Session');
db.TimingReport = require('./sequelize/TimingReport');

// Associations can be defined here if needed

module.exports = db;