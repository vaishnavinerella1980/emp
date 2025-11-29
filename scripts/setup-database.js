const { sequelize } = require('../src/config/database');
const { generateId, hashPassword } = require('../src/utils/crypto');

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Employee Tracking Database...');
    
    // 1. Sync all models (create tables)
    console.log('🔄 Creating database tables...');
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created successfully');
    
    // 2. Seed office locations
    console.log('🏢 Seeding office locations...');
    await seedOfficeLocations();
    
    // 3. Seed demo users
    console.log('👥 Seeding demo users...');
    await seedDemoUsers();
    
    // 4. Verify setup
    console.log('🔍 Verifying database setup...');
    await verifySetup();
    
    console.log('🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!');
    console.log('📊 You can now start the server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

async function seedOfficeLocations() {
  const OfficeLocation = require('../src/models/sequelize/OfficeLocation');
  
  const offices = [
    {
      office_name: 'ACS',
      latitude: 12.9716,
      longitude: 77.5946,
      radius_meters: 100,
      address: 'ACS Office, Bangalore, India',
      is_active: true
    },
    {
      office_name: 'IOTIQ', 
      latitude: 17.3850,
      longitude: 78.4867,
      radius_meters: 100,
      address: 'IOTIQ Office, Hyderabad, India',
      is_active: true
    }
  ];
  
  for (const office of offices) {
    await OfficeLocation.create(office);
    console.log(`✅ Added office: ${office.office_name}`);
  }
}

async function seedDemoUsers() {
  const Employee = require('../src/models/sequelize/Employee');
  const { USER_ROLES, DEPARTMENTS } = require('../src/config/constants');
  
  const commonPassword = await hashPassword('123456');
  
  const demoUsers = [
    // Admin Users
    {
      id: generateId(),
      name: 'Super Admin',
      email: 'admin@acs.com',
      password: commonPassword,
      phone: '+91-9876543210',
      department: DEPARTMENTS.IT,
      position: 'System Administrator',
      role: USER_ROLES.ADMIN,
      office: 'ACS',
      is_active: true
    },
    {
      id: generateId(),
      name: 'IOTIQ Admin',
      email: 'admin@iotiq.com',
      password: commonPassword,
      phone: '+91-9876543212', 
      department: DEPARTMENTS.IT,
      position: 'Administrator',
      role: USER_ROLES.ADMIN,
      office: 'IOTIQ',
      is_active: true
    },
    // Manager Users
    {
      id: generateId(),
      name: 'IT Manager ACS',
      email: 'it.manager@acs.com',
      password: commonPassword,
      phone: '+91-9876543214',
      department: DEPARTMENTS.IT,
      position: 'IT Manager',
      role: USER_ROLES.MANAGER,
      office: 'ACS',
      is_active: true
    },
    {
      id: generateId(),
      name: 'HR Manager ACS',
      email: 'hr.manager@acs.com',
      password: commonPassword,
      phone: '+91-9876543216',
      department: DEPARTMENTS.HR,
      position: 'HR Manager', 
      role: USER_ROLES.MANAGER,
      office: 'ACS',
      is_active: true
    },
    // Sample Employees
    {
      id: generateId(),
      name: 'John Developer',
      email: 'john.developer@acs.com',
      password: commonPassword,
      phone: '+91-9876543220',
      department: DEPARTMENTS.IT,
      position: 'Software Developer',
      role: USER_ROLES.EMPLOYEE,
      office: 'ACS',
      is_active: true
    },
    {
      id: generateId(),
      name: 'Sarah HR Executive',
      email: 'sarah.hr@acs.com',
      password: commonPassword,
      phone: '+91-9876543222',
      department: DEPARTMENTS.HR,
      position: 'HR Executive',
      role: USER_ROLES.EMPLOYEE, 
      office: 'ACS',
      is_active: true
    }
  ];
  
  for (const user of demoUsers) {
    await Employee.create(user);
    console.log(`✅ Added user: ${user.email} (${user.role})`);
  }
}

async function verifySetup() {
  const Employee = require('../src/models/sequelize/Employee');
  const OfficeLocation = require('../src/models/sequelize/OfficeLocation');
  
  const employeeCount = await Employee.count();
  const officeCount = await OfficeLocation.count();
  
  console.log(`📊 Verification: ${employeeCount} employees, ${officeCount} offices`);
  
  if (employeeCount === 0 || officeCount === 0) {
    throw new Error('Database setup verification failed');
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };