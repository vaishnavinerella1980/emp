const postgres = require('./postgres');
const { NODE_ENV } = require('./environment');

const connectDatabase = async () => {
  try {
    await postgres.connect();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

const closeDatabase = async () => {
  try {
    await postgres.disconnect();
  } catch (error) {
    console.error('❌ Error closing database:', error);
    throw error;
  }
};

// For backward compatibility
const getDb = () => postgres.getSequelize();

module.exports = {
  connectDatabase,
  closeDatabase,
  getDb,
  sequelize: postgres.getSequelize()
};