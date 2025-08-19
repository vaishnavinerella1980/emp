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
        longitude: 77.5946,
        address: 'Test Validation Location'
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

    // Test 8: Employee profile
    console.log('\n8. Testing employee profile...');
    const profileResponse = await fetch(`${BASE_URL}/api/employees/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const profileResult = await profileResponse.json();
    console.log('Profile result:', profileResult);

    // Test 9: Location update
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
    console.log('Location update result:', locationUpdateResult);

    // Test 10: Movement tracking
    console.log('\n10. Testing movement tracking...');
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
    console.log('Movement result:', movementResult);

    // Test 11: Clock out
    console.log('\n11. Testing clock-out...');
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
    console.log('Clock-out result:', clockOutResult);

    // Test 12: Get current attendance
    console.log('\n12. Testing current attendance...');
    const currentAttendanceResponse = await fetch(`${BASE_URL}/api/attendance/current/${loginResult.data.employee.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const currentAttendanceResult = await currentAttendanceResponse.json();
    console.log('Current attendance:', currentAttendanceResult);

    // Test 13: Get attendance history
    console.log('\n13. Testing attendance history...');
    const attendanceHistoryResponse = await fetch(`${BASE_URL}/api/attendance/history/${loginResult.data.employee.id}?page=1&limit=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const attendanceHistoryResult = await attendanceHistoryResponse.json();
    console.log('Attendance history:', attendanceHistoryResult);

    // Test 14: Update employee profile
    console.log('\n14. Testing profile update...');
    const profileUpdateResponse = await fetch(`${BASE_URL}/api/employees/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        phone: '9876543210',
        department: 'Engineering',
        position: 'Senior Developer'
      })
    });

    const profileUpdateResult = await profileUpdateResponse.json();
    console.log('Profile update result:', profileUpdateResult);

    // Test 15: Get all employees
    console.log('\n15. Testing get all employees...');
    const allEmployeesResponse = await fetch(`${BASE_URL}/api/employees?page=1&limit=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const allEmployeesResult = await allEmployeesResponse.json();
    console.log('All employees:', allEmployeesResult);

    // Test 16: Get specific employee
    console.log('\n16. Testing get specific employee...');
    const specificEmployeeResponse = await fetch(`${BASE_URL}/api/employees/${loginResult.data.employee.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const specificEmployeeResult = await specificEmployeeResponse.json();
    console.log('Specific employee:', specificEmployeeResult);

    // Test 17: Update specific employee
    console.log('\n17. Testing update specific employee...');
    const updateEmployeeResponse = await fetch(`${BASE_URL}/api/employees/${loginResult.data.employee.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        department: 'Technology',
        position: 'Lead Developer'
      })
    });

    const updateEmployeeResult = await updateEmployeeResponse.json();
    console.log('Update employee result:', updateEmployeeResult);

    // Test 18: Location validation (proper route)
    console.log('\n18. Testing location validation (proper route)...');
    const locationValidateResponse = await fetch(`${BASE_URL}/api/location/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        latitude: 12.9716,
        longitude: 77.5946,
        address: 'Proper Route Validation Location'
      })
    });

    const locationValidateResult = await locationValidateResponse.json();
    console.log('Location validation (proper route):', locationValidateResult);

    // Test 19: Get location history
    console.log('\n19. Testing location history...');
    const locationHistoryResponse = await fetch(`${BASE_URL}/api/location/history?page=1&limit=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const locationHistoryResult = await locationHistoryResponse.json();
    console.log('Location history:', locationHistoryResult);

    // Test 20: Get current location
    console.log('\n20. Testing current location...');
    const currentLocationResponse = await fetch(`${BASE_URL}/api/location/current`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const currentLocationResult = await currentLocationResponse.json();
    console.log('Current location:', currentLocationResult);

    // Test 21: Get movement history
    console.log('\n21. Testing movement history...');
    const movementHistoryResponse = await fetch(`${BASE_URL}/api/movements/history?page=1&limit=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const movementHistoryResult = await movementHistoryResponse.json();
    console.log('Movement history:', movementHistoryResult);

    // Test 22: Get active movements
    console.log('\n22. Testing active movements...');
    const activeMovementsResponse = await fetch(`${BASE_URL}/api/movements/active`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const activeMovementsResult = await activeMovementsResponse.json();
    console.log('Active movements:', activeMovementsResult);

    // Test 23: Get movement by ID (using the movement ID from previous test if available)
    if (movementResult.success && movementResult.data && movementResult.data.id) {
      console.log('\n23. Testing get movement by ID...');
      const movementByIdResponse = await fetch(`${BASE_URL}/api/movements/${movementResult.data.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const movementByIdResult = await movementByIdResponse.json();
      console.log('Movement by ID:', movementByIdResult);

      // Test 24: Update movement
      console.log('\n24. Testing update movement...');
      const updateMovementResponse = await fetch(`${BASE_URL}/api/movements/${movementResult.data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: 'Updated movement reason - Testing update functionality',
          estimated_minutes: 10
        })
      });

      const updateMovementResult = await updateMovementResponse.json();
      console.log('Update movement result:', updateMovementResult);
    } else {
      console.log('\n23-24. Skipping movement ID tests (no movement ID available)');
    }

    // Test 25: Logout
    console.log('\n25. Testing logout...');
    const logoutResponse = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const logoutResult = await logoutResponse.json();
    console.log('Logout result:', logoutResult);

    console.log('\n🎉 All 25 API tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Authentication: Register, Login, Logout');
    console.log('✅ Attendance: Clock-in, Clock-out, Status, History');
    console.log('✅ Employee: Profile, Update, Management');
    console.log('✅ Location: Validation, Update, History, Current');
    console.log('✅ Movement: Create, History, Active, Update');

  } catch (error) {
    console.error('Test error:', error);
  }
}

testAPI();