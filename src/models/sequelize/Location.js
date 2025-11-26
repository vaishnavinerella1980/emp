const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Location = sequelize.define('Location', {
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
  accuracy: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  heading: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  speed: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  battery_level: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  is_mock_location: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'locations',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Location;