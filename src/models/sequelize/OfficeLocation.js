const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const OfficeLocation = sequelize.define('OfficeLocation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  office_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  radius_meters: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    comment: 'Detection radius for auto-office assignment'
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'office_locations',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = OfficeLocation;