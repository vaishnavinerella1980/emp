const { USER_ROLES, OFFICES, DEPARTMENTS } = require('../config/constants');
const { generateId, hashPassword } = require('../utils/crypto');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('👥 Seeding demo users...');
    
    // Hash common password for all demo users
    const commonPassword = await hashPassword('123456');
    
    const demoUsers = [
      // ADMIN USERS (Full access to both offices)
      {
        id: generateId(),
        name: 'Super Admin',
        email: 'admin@acs.com',
        password: commonPassword,
        phone: '+91-9876543210',
        department: DEPARTMENTS.IT,
        position: 'System Administrator',
        address: 'Bangalore, India',
        emergency_contact: '+91-9876543211',
        role: USER_ROLES.ADMIN,
        office: OFFICES.ACS,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: generateId(),
        name: 'IOTIQ Admin',
        email: 'admin@iotiq.com',
        password: commonPassword,
        phone: '+91-9876543212',
        department: DEPARTMENTS.IT,
        position: 'Administrator',
        address: 'Hyderabad, India',
        emergency_contact: '+91-9876543213',
        role: USER_ROLES.ADMIN,
        office: OFFICES.IOTIQ,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // MANAGER USERS (ACS Office)
      {
        id: generateId(),
        name: 'John Manager - IT',
        email: 'it.manager@acs.com',
        password: commonPassword,
        phone: '+91-9876543214',
        department: DEPARTMENTS.IT,
        position: 'IT Manager',
        address: 'Bangalore, India',
        emergency_contact: '+91-9876543215',
        role: USER_ROLES.MANAGER,
        office: OFFICES.ACS,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: generateId(),
        name: 'Sarah Manager - HR',
        email: 'hr.manager@acs.com',
        password: commonPassword,
        phone: '+91-9876543216',
        department: DEPARTMENTS.HR,
        position: 'HR Manager',
        address: 'Bangalore, India',
        emergency_contact: '+91-9876543217',
        role: USER_ROLES.MANAGER,
        office: OFFICES.ACS,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // MANAGER USERS (IOTIQ Office)
      {
        id: generateId(),
        name: 'Mike Manager - IT',
        email: 'it.manager@iotiq.com',
        password: commonPassword,
        phone: '+91-9876543218',
        department: DEPARTMENTS.IT,
        position: 'IT Manager',
        address: 'Hyderabad, India',
        emergency_contact: '+91-9876543219',
        role: USER_ROLES.MANAGER,
        office: OFFICES.IOTIQ,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Only insert users that don't already exist
    for (const user of demoUsers) {
      const existingUser = await queryInterface.sequelize.query(
        `SELECT id FROM employees WHERE email = '${user.email}'`,
        { type: Sequelize.QueryTypes.SELECT }
      );
      
      if (existingUser.length === 0) {
        await queryInterface.bulkInsert('employees', [user]);
        console.log(`✅ Added demo user: ${user.email}`);
      } else {
        console.log(`⚠️ User already exists: ${user.email}`);
      }
    }
    
    console.log('✅ Demo users seeding completed');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove demo users if needed
    await queryInterface.bulkDelete('employees', {
      email: {
        [Sequelize.Op.in]: [
          'admin@acs.com',
          'admin@iotiq.com', 
          'it.manager@acs.com',
          'hr.manager@acs.com',
          'it.manager@iotiq.com'
        ]
      }
    });
  }
};