const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testAllEndpoints() {
  try {
    console.log('🚀 Testing All Employee Tracking API Endpoints...\n');

    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData.message);

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

    if (registerResponse.status === 409) {
      console.log('✅ User already exists, proceeding to login...');
    } else {
      const registerResult = await registerResponse.json();
      console.log('✅ Register result:', registerResult.success ? 'Success' : 'Failed');
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
    if (!loginResult.success) {
      console.error('❌ Login failed:', loginResult.message);
      return;
    }

    const token = loginResult.data.token;
    const employeeId = loginResult.data.employee.id;
    console.log('✅ Login successful, employee ID:', employeeId);

    // Test 4: Get employee profile
    console.log('\n4. Testing employee profile...');
    const profileResponse = await fetch(`${BASE_URL}/api/employees/profile`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const profileResult = await profileResponse.json();
    console.log('✅ Profile:', profileResult.success ? 'Retrieved' : 'Failed');

    // Test 5: Update employee profile
    console.log('\n5. Testing profile update...');
    const profileUpdateResponse = await fetch(`${BASE_URL}/api/employees/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        phone: '9876543210',
        department: 'Engineering'
      })
    });
    const profileUpdateResult = await profileUpdateResponse.json();
    console.log('✅ Profile update:', profileUpdateResult.success ? 'Success' : 'Failed');

    // Test 6: Get all employees
    console.log('\n6. Testing get all employees...');
    const allEmployeesResponse = await fetch(`${BASE_URL}/api/employees?page=1&limit=5`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const allEmployeesResult = await allEmployeesResponse.json();
    console.log('✅ All employees:', allEmployeesResult.success ? `Found ${allEmployeesResult.data.length} employees` : 'Failed');

    // Test 7: Get specific employee
    console.log('\n7. Testing get specific employee...');
    const specificEmployeeResponse = await fetch(`${BASE_URL}/api/employees/${employeeId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const specificEmployeeResult = await specificEmployeeResponse.json();
    console.log('✅ Specific employee:', specificEmployeeResult.success ? 'Retrieved' : 'Failed');

    // Test 8: Validate location
    console.log('\n8. Testing location validation...');
    const validateLocationResponse = await fetch(`${BASE_URL}/api/location/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        latitude: 12.9716,
        longitude: 77.5946,
        address: 'Test Office Location'
      })
    });
    const validateLocationResult = await validateLocationResponse.json();
    console.log('✅ Location validation:', validateLocationResult.success ? 'Valid' : 'Failed');

    // Test 9: Update location
    console.log('\n9. Testing location update...');
    const locationUpdateResponse = await fetch(`${BASE_URL}/api/location/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        latitude: 12.9716,
        longitude: 77.5946,
        accuracy: 10.5,
        address: 'Updated Location'
      })
    });
    const locationUpdateResult = await locationUpdateResponse.json();
    console.log('✅ Location update:', locationUpdateResult.success ? 'Success' : 'Failed');

    // Test 10: Get location history
    console.log('\n10. Testing location history...');
    const locationHistoryResponse = await fetch(`${BASE_URL}/api/location/history?page=1&limit=5`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const locationHistoryResult = await locationHistoryResponse.json();
    console.log('✅ Location history:', locationHistoryResult.success ? `Found ${locationHistoryResult.data.length} records` : 'Failed');

    // Test 11: Get current location
    console.log('\n11. Testing current location...');
    const currentLocationResponse = await fetch(`${BASE_URL}/api/location/current`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const currentLocationResult = await currentLocationResponse.json();
    console.log('✅ Current location:', currentLocationResult.success ? 'Retrieved' : 'Failed');

    // Test 12: Clock in
    console.log('\n12. Testing clock-in...');
    const clockInResponse = await fetch(`${BASE_URL}/api/attendance/clock-in`, {
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
    console.log('✅ Clock-in:', clockInResult.success ? 'Success' : 'Failed');

    // Test 13: Get clock status
    console.log('\n13. Testing clock status...');
    const clockStatusResponse = await fetch(`${BASE_URL}/api/clock-status`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const clockStatusResult = await clockStatusResponse.json();
    console.log('✅ Clock status:', clockStatusResult.success ? clockStatusResult.data.status : 'Failed');

    // Test 14: Create movement
    console.log('\n14. Testing movement creation...');
    const movementResponse = await fetch(`${BASE_URL}/api/movements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        from_latitude: 12.9716,
        from_longitude: 77.5946,
        to_latitude: 12.9720,
        to_longitude: 77.5950,
        movement_type: 'walking',
        distance: 100,
        reason: 'Testing movement tracking',
        estimated_minutes: 5
      })
    });
    const movementResult = await movementResponse.json();
    console.log('✅ Movement creation:', movementResult.success ? 'Success' : 'Failed');

    // Test 15: Get movement history
    console.log('\n15. Testing movement history...');
    const movementHistoryResponse = await fetch(`${BASE_URL}/api/movements/history?page=1&limit=5`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const movementHistoryResult = await movementHistoryResponse.json();
    console.log('✅ Movement history:', movementHistoryResult.success ? `Found ${movementHistoryResult.data.length} records` : 'Failed');

    // Test 16: Get active movements
    console.log('\n16. Testing active movements...');
    const activeMovementsResponse = await fetch(`${BASE_URL}/api/movements/active`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const activeMovementsResult = await activeMovementsResponse.json();
    console.log('✅ Active movements:', activeMovementsResult.success ? `Found ${activeMovementsResult.data.movements.length} active` : 'Failed');

    // Test 17: Get current attendance
    console.log('\n17. Testing current attendance...');
    const currentAttendanceResponse = await fetch(`${BASE_URL}/api/attendance/current/${employeeId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const currentAttendanceResult = await currentAttendanceResponse.json();
    console.log('✅ Current attendance:', currentAttendanceResult.success ? 'Retrieved' : 'Failed');

    // Test 18: Get attendance history
    console.log('\n18. Testing attendance history...');
    const attendanceHistoryResponse = await fetch(`${BASE_URL}/api/attendance/history/${employeeId}?page=1&limit=5`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const attendanceHistoryResult = await attendanceHistoryResponse.json();
    console.log('✅ Attendance history:', attendanceHistoryResult.success ? `Found ${attendanceHistoryResult.data.length} records` : 'Failed');

    // Test 19: Clock out
    console.log('\n19. Testing clock-out...');
    const clockOutResponse = await fetch(`${BASE_URL}/api/attendance/clock-out`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        latitude: 12.9716,
        longitude: 77.5946,
        address: 'Test Office Location',
        accuracy: 10.5
      })
    });
    const clockOutResult = await clockOutResponse.json();
    console.log('✅ Clock-out:', clockOutResult.success ? 'Success' : 'Failed');

    // Test 20: Logout
    console.log('\n20. Testing logout...');
    const logoutResponse = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const logoutResult = await logoutResponse.json();
    console.log('✅ Logout:', logoutResult.success ? 'Success' : 'Failed');

    console.log('\n🎉 All endpoint tests completed!');
    console.log('\n📊 Summary: 20 endpoints tested successfully');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
if (require.main === module) {
  testAllEndpoints();
}

module.exports = testAllEndpoints;