const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { MOVEMENT_STATUS } = require('../../config/constants');

const Movement = sequelize.define('Movement', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  employee_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING,
    defaultValue: 'General Movement'
  },
  estimated_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM(...Object.values(MOVEMENT_STATUS)),
    defaultValue: MOVEMENT_STATUS.ACTIVE
  },
  address: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  return_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actual_duration_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // NEW FIELD: Link movement to attendance session
  attendance_id: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Links movement to specific attendance session for path tracking'
  },
  // NEW FIELD: Movement type
  movement_type: {
    type: DataTypes.ENUM('CLOCK_IN_PATH', 'MANUAL_MOVEMENT'),
    defaultValue: 'MANUAL_MOVEMENT'
  }
}, {
  tableName: 'movements',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Movement;