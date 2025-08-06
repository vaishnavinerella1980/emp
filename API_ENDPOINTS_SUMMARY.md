# API Endpoints Summary

## Base URL: `http://localhost:3000`

## ✅ Working Endpoints (Tested Successfully)

### 1. **Health Check**
```
GET /health
GET /api/health
```
**Response:** Server status and employee count

### 2. **Authentication**
```
POST /api/auth/register
POST /api/auth/login  
POST /api/auth/logout
```

### 3. **Location & Clock-In APIs**

#### **Validate Location**
```
POST /api/validate-location
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

#### **Clock In** ⭐
```
POST /api/clock-in
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "address": "Office Location",
  "accuracy": 10.5,
  "timestamp": "2025-08-05T08:42:49.611Z",
  "device_info": {
    "battery_level": 85,
    "is_mock_location": false
  }
}
```

#### **Clock Out** ⭐
```
POST /api/clock-out
```
**Headers:** `Authorization: Bearer <token>`
**Body:** Same as clock-in

#### **Clock Status** ⭐
```
GET /api/clock-status
```
**Headers:** `Authorization: Bearer <token>`

#### **Current Location**
```
GET /api/current-location/:employeeId
```
**Headers:** `Authorization: Bearer <token>`

### 4. **Employee Management**
```
GET /api/employees
GET /api/employees/:id
PUT /api/employees/:id
```

### 5. **Attendance Records**
```
POST /api/attendance
PUT /api/attendance/:id
GET /api/attendance/employee/:employeeId
```

### 6. **Movement Records**
```
POST /api/movements
PUT /api/movements/:id
GET /api/movements/employee/:employeeId
```

### 7. **Location Updates**
```
POST /api/location-updates
GET /api/location-updates/employee/:employeeId
```

## 🔧 Troubleshooting

### If you're getting "endpoint not found":

1. **Check the URL:** Make sure you're using the correct base URL
   ```
   ❌ Wrong: http://localhost:3000/clock-in
   ✅ Correct: http://localhost:3000/api/clock-in
   ```

2. **Check the method:** Make sure you're using POST for clock-in
   ```javascript
   fetch('/api/clock-in', {
     method: 'POST',  // Important!
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer ' + token
     },
     body: JSON.stringify({
       latitude: lat,
       longitude: lng
     })
   })
   ```

3. **Check authentication:** Make sure you have a valid token
   ```javascript
   // Get token from login first
   const loginResponse = await fetch('/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, password })
   });
   const { token } = await loginResponse.json();
   ```

4. **Check request body:** Make sure latitude and longitude are included
   ```javascript
   // Required fields for clock-in
   {
     "latitude": 12.9716,    // Required
     "longitude": 77.5946    // Required
   }
   ```

### If you're getting "clock-in failed":

1. **Check if already clocked in:** You can only clock in once per day
2. **Check coordinates:** Make sure lat/lng are valid numbers
3. **Check authentication:** Make sure token is valid and not expired

## 📱 Frontend Integration Example

```javascript
// Complete clock-in flow
async function clockInEmployee() {
  try {
    // 1. Get user location
    const position = await getCurrentPosition();
    const { latitude, longitude, accuracy } = position.coords;
    
    // 2. Validate location (optional)
    const validateResponse = await fetch('/api/validate-location', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ latitude, longitude })
    });
    
    // 3. Clock in
    const clockInResponse = await fetch('/api/clock-in', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        latitude,
        longitude,
        accuracy,
        address: 'Current Location',
        timestamp: new Date().toISOString()
      })
    });
    
    const result = await clockInResponse.json();
    
    if (result.success) {
      console.log('Clock-in successful:', result);
    } else {
      console.error('Clock-in failed:', result.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    });
  });
}
```

## 🎯 Test Results

All endpoints tested successfully:
- ✅ Registration: Working
- ✅ Login: Working  
- ✅ Location validation: Working
- ✅ Clock-in: Working
- ✅ Clock-out: Working
- ✅ Clock status: Working
- ✅ Data storage: MongoDB working

**Server Status:** Running on port 3000
**Database:** MongoDB Atlas connected
**Data Storage:** All data is being saved to MongoDB