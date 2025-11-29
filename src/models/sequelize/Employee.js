const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { USER_ROLES, OFFICES } = require('../../config/constants');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  department: {
    type: DataTypes.STRING,
    defaultValue: 'General'
  },
  position: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  address: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  emergency_contact: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  profile_image: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  role: {
    type: DataTypes.ENUM(...Object.values(USER_ROLES)),
    defaultValue: USER_ROLES.EMPLOYEE
  },
  office: {
    type: DataTypes.ENUM(...Object.values(OFFICES)),
    defaultValue: OFFICES.ACS
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  reset_token: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  reset_token_expiry: {
    type: DataTypes.DATE,
    defaultValue: null
  }
}, {
  tableName: 'employees',
  underscored: true,
  timestamps: true
});

module.exports = Employee;