const { OFFICES } = require('../config/constants');
const { generateId } = require('../utils/crypto');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🌍 Seeding office locations...');
    
    const offices = [
      {
        id: 1,
        office_name: OFFICES.ACS,
        latitude: 12.9716,  // Bangalore
        longitude: 77.5946,
        radius_meters: 100,
        address: 'ACS Office, Bangalore, India',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        office_name: OFFICES.IOTIQ,
        latitude: 17.3850,  // Hyderabad
        longitude: 78.4867,
        radius_meters: 100,
        address: 'IOTIQ Office, Hyderabad, India',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('office_locations', offices);
    console.log('✅ Office locations seeded successfully');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('office_locations', null, {});
  }
};