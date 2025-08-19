const bcrypt = require('bcrypt');
const crypto = require('crypto');

const SALT_ROUNDS = 10;

/**
 * Generate a unique ID
 */
const generateId = () => {
  const timestamp = Date.now();
  const randomPart = crypto.randomBytes(4).toString('hex');
  return `${timestamp}_${randomPart}`;
};

/**
 * Hash a password using bcrypt
 */
const hashPassword = async (password) => {
  try {
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    console.log('Password hashed successfully');
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Compare a plain text password with a hashed password
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    console.log('Comparing password...');
    console.log('Plain password length:', plainPassword.length);
    console.log('Hashed password length:', hashedPassword.length);
    console.log('Hash starts with:', hashedPassword.substring(0, 7));
    
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Password comparison result:', isValid);
    return isValid;
  } catch (error) {
    console.error('Error comparing password:', error);
    return false;
  }
};

/**
 * Generate a random token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a secure random string
 */
const generateRandomString = (length = 16) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

/**
 * Hash data using SHA-256
 */
const hashSHA256 = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

module.exports = {
  generateId,
  hashPassword,
  comparePassword,
  generateToken,
  generateRandomString,
  hashSHA256
};