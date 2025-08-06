const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  try {
    console.log('Testing Employee Tracking API...\n');

    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health:', healthData);

    // Test 2: Register a test user
    console.log('\n2. Registering test user...');
    const registerData = {
      name: 'Test Employee',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890',
      department: 'IT',
      position: 'Developer'
    };

    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    let registerResult;
    if (registerResponse.status === 409) {
      console.log('User already exists, proceeding to login...');
    } else {
      registerResult = await registerResponse.json();
      console.log('Register result:', registerResult);
    }

    // Test 3: Login
    console.log('\n3. Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    const loginResult = await loginResponse.json();
    console.log('Login result:', loginResult);

    if (!loginResult.success) {
      console.error('Login failed:', loginResult.message);
      return;
    }

    const token = loginResult.token;

    // Test 4: Validate location
    console.log('\n4. Testing location validation...');
    const validateLocationResponse = await fetch(`${BASE_URL}/api/validate-location`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        latitude: 12.9716,
        longitude: 77.5946
      })
    });

    const validateLocationResult = await validateLocationResponse.json();
    console.log('Location validation:', validateLocationResult);

    // Test 5: Clock status (before clock-in)
    console.log('\n5. Checking clock status...');
    const clockStatusResponse = await fetch(`${BASE_URL}/api/clock-status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const clockStatusResult = await clockStatusResponse.json();
    console.log('Clock status:', clockStatusResult);

    // Test 6: Clock in
    console.log('\n6. Testing clock-in...');
    const clockInResponse = await fetch(`${BASE_URL}/api/clock-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        latitude: 12.9716,
        longitude: 77.5946,
        address: 'Test Office Location',
        accuracy: 10.5,
        device_info: {
          battery_level: 85,
          is_mock_location: false
        }
      })
    });

    const clockInResult = await clockInResponse.json();
    console.log('Clock-in result:', clockInResult);

    // Test 7: Clock status (after clock-in)
    console.log('\n7. Checking clock status after clock-in...');
    const clockStatusAfterResponse = await fetch(`${BASE_URL}/api/clock-status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const clockStatusAfterResult = await clockStatusAfterResponse.json();
    console.log('Clock status after:', clockStatusAfterResult);

  } catch (error) {
    console.error('Test error:', error);
  }
}

testAPI();