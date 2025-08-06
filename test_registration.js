const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testRegistration() {
  try {
    console.log('🧪 Testing Registration API...\n');

    // Test data
    const testUser = {
      name: 'Test User',
      email: 'test.user@example.com',
      password: 'password123',
      confirm_password: 'password123',
      phone: '+1234567890',
      department: 'IT',
      position: 'Developer',
      address: '123 Test Street',
      emergency_contact: '+0987654321'
    };

    console.log('📤 Sending registration request...');
    console.log('Data:', JSON.stringify(testUser, null, 2));

    const response = await axios.post(`${BASE_URL}/auth/register`, testUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Registration successful!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('\n❌ Registration failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
}

async function testHealthCheck() {
  try {
    console.log('\n🏥 Testing Health Check...');
    
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Health check failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
}

async function runTests() {
  await testHealthCheck();
  await testRegistration();
}

// Run tests
runTests();