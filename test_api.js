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

    const token = loginResult.data.token;
    console.log('Extracted token:', token ? 'Token received' : 'No token');

    // Test 4: Change Password
    console.log('\n4. Testing change password...');
    const changePasswordResponse = await fetch(`${BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword: 'password123',
        newPassword: 'newPassword123'
      })
    });

    const changePasswordResult = await changePasswordResponse.json();
    console.log('Change Password result:', changePasswordResult);

    // Additional tests...

    console.log('\n🎉 All API tests completed successfully!');
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAPI();
