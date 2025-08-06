const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const generateId = () => `${Date.now()}_${uuidv4().slice(0, 8)}`;

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const hashPassword = async (password) => {
  const bcrypt = require('bcrypt');
  return await bcrypt.hash(password, 12);
};

const comparePassword = async (password, hashedPassword) => {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  generateId,
  generateToken,
  hashPassword,
  comparePassword
};
