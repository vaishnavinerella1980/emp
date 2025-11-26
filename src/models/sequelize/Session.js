const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Session = sequelize.define('Session', {
  employee_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  token: {
    type: DataTypes.TEXT,  // TEXT for unlimited length
    allowNull: false,
    unique: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'sessions',
  underscored: true,
  timestamps: false
});

module.exports = Session;