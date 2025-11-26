const { sequelize } = require('../src/config/database');

async function testConnection() {
  try {
    console.log('🔗 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test basic queries
    const Employee = require('../src/models/sequelize/Employee');
    const employeeCount = await Employee.count();
    console.log(`📊 Found ${employeeCount} employees in database`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('💡 Run: npm run setup-db to initialize database');
    process.exit(1);
  }
}

testConnection();