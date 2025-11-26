const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const TimingReport = sequelize.define('TimingReport', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  employee_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  first_clock_in: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_clock_in: {
    type: DataTypes.DATE,
    allowNull: true
  },
  first_clock_out: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_clock_out: {
    type: DataTypes.DATE,
    allowNull: true
  },
  total_cycles: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of complete clock-in/clock-out cycles'
  },
  total_hours: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    comment: 'Total hours worked for the day'
  },
  employee_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  office: {
    type: DataTypes.ENUM('ACS', 'IOTIQ'),
    allowNull: false
  }
}, {
  tableName: 'timing_reports',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['employee_id', 'date']
    },
    {
      fields: ['date']
    },
    {
      fields: ['department']
    },
    {
      fields: ['office']
    }
  ]
});

module.exports = TimingReport;