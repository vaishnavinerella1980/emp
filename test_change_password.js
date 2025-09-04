const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testChangePassword() {
  try {
    console.log('Testing Change Password API...\n');

    // First, login to get a token
    console.log('1. Logging in...');
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

    // Test change password
    console.log('\n2. Testing change password...');
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

    if (changePasswordResult.success) {
      console.log('✅ Change password test passed!');
    } else {
      console.log('❌ Change password test failed:', changePasswordResult.message);
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testChangePassword();
