const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { ATTENDANCE_STATUS } = require('../../config/constants');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  employee_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  employee_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  clock_in_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  clock_out_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  clock_in_location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  clock_out_location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  clock_in_address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  clock_out_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  total_hours: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(...Object.values(ATTENDANCE_STATUS)),
    defaultValue: ATTENDANCE_STATUS.ACTIVE
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'attendances',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Attendance;