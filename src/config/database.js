// const postgres = require('./postgres');
// const { NODE_ENV } = require('./environment');

// const connectDatabase = async () => {
//   try {
//     await postgres.connect();
//   } catch (error) {
//     console.error('❌ Database connection failed:', error);
//     process.exit(1);
//   }
// };

// const closeDatabase = async () => {
//   try {
//     await postgres.disconnect();
//   } catch (error) {
//     console.error('❌ Error closing database:', error);
//     throw error;
//   }
// };

// // For backward compatibility
// const getDb = () => postgres.getSequelize();

// module.exports = {
//   connectDatabase,
//   closeDatabase,
//   getDb,
//   sequelize: postgres.getSequelize()
// };
const { Sequelize } = require('sequelize');

// Database URL from environment variable
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create Sequelize instance with SSL configuration for Render
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,              // ✅ REQUIRED for Render
      rejectUnauthorized: false   // ✅ REQUIRED for Render
    }
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test database connection
async function connectDatabase() {
  try {
    console.log('🔗 Connecting to PostgreSQL...');
    console.log(`📍 Host: ${DATABASE_URL ? 'Configured' : '❌ Missing'}`);
    
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync all models
    console.log('🔄 Syncing database models...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
    
    // Log table count
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log(`📊 Found ${tables.length} tables:`, tables.join(', '));
    
    return sequelize;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('📋 Full error:', error);
    
    // Retry after 5 seconds
    console.log('🔄 Retrying database connection in 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    return connectDatabase();
  }
}

// Close database connection
async function closeDatabase() {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database:', error.message);
    throw error;
  }
}

module.exports = {
  sequelize,
  connectDatabase,
  closeDatabase
};
```

---

### Step 2: Add Environment Variable to Render (Critical!)

1. Go to: https://dashboard.render.com
2. Click on your **Web Service** (empserv)
3. Click **"Environment"** tab on the left
4. Click **"Add Environment Variable"**
5. Add this:
```
   Key: DATABASE_URL
   Value: postgresql://employee_tracking_qkxd_user:695rJZCailafve3mrq5ZdZxXqnMafuyx@dpg-d4ko080gjchc73aa37u0-a/employee_tracking_qkxd
```

6. Also add these if not already there:
```
   Key: NODE_ENV
   Value: production
   
   Key: PORT
   Value: 3000
