# Clock-In API Documentation

## Overview
These APIs handle location-based clock-in and clock-out functionality for employees. All endpoints require authentication.

## Endpoints

### 1. Validate Location
**POST** `/api/validate-location`

Validates if the provided coordinates are valid and within office radius.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

**Response:**
```json
{
  "success": true,
  "location_valid": true,
  "coordinates": {
    "latitude": 12.9716,
    "longitude": 77.5946
  },
  "office_validation": {
    "is_within_radius": true,
    "distance_from_office": 150,
    "office_radius": 1000
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Clock In
**POST** `/api/clock-in`

Records employee clock-in with location data.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "address": "123 Main Street, City",
  "accuracy": 10.5,
  "timestamp": "2024-01-15T09:00:00.000Z",
  "device_info": {
    "battery_level": 85,
    "is_mock_location": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully clocked in",
  "record": {
    "id": "1705312800000_abc12345",
    "employee_id": "emp_123",
    "login_time": "2024-01-15T09:00:00.000Z",
    "login_latitude": 12.9716,
    "login_longitude": 77.5946,
    "login_address": "123 Main Street, City",
    "status": "active",
    "reason": "Regular Work"
  },
  "location": {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "address": "123 Main Street, City",
    "accuracy": 10.5
  },
  "clock_in_time": "2024-01-15T09:00:00.000Z",
  "timestamp": "2024-01-15T09:00:00.000Z"
}
```

### 3. Clock Out
**POST** `/api/clock-out`

Records employee clock-out with location data.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "address": "123 Main Street, City",
  "accuracy": 8.2,
  "timestamp": "2024-01-15T18:00:00.000Z",
  "device_info": {
    "battery_level": 45,
    "is_mock_location": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully clocked out",
  "record": {
    "id": "1705312800000_abc12345",
    "employee_id": "emp_123",
    "login_time": "2024-01-15T09:00:00.000Z",
    "logout_time": "2024-01-15T18:00:00.000Z",
    "login_latitude": 12.9716,
    "login_longitude": 77.5946,
    "logout_latitude": 12.9716,
    "logout_longitude": 77.5946,
    "status": "completed"
  },
  "location": {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "address": "123 Main Street, City",
    "accuracy": 8.2
  },
  "clock_out_time": "2024-01-15T18:00:00.000Z",
  "work_duration": {
    "hours": 9,
    "minutes": 0,
    "total_minutes": 540,
    "formatted": "9h 0m"
  }
}
```

### 4. Get Clock Status
**GET** `/api/clock-status`

Gets current clock-in status for the authenticated employee.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (Clocked In):**
```json
{
  "success": true,
  "is_clocked_in": true,
  "record": {
    "id": "1705312800000_abc12345",
    "employee_id": "emp_123",
    "login_time": "2024-01-15T09:00:00.000Z",
    "status": "active"
  },
  "work_duration": {
    "hours": 2,
    "minutes": 30,
    "total_minutes": 150
  },
  "status": "active"
}
```

**Response (Not Clocked In):**
```json
{
  "success": true,
  "is_clocked_in": false,
  "message": "Not clocked in today",
  "record": null
}
```

### 5. Get Current Location
**GET** `/api/current-location/:employeeId`

Gets the most recent location data for an employee.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "location": {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "address": "123 Main Street, City",
    "accuracy": 10.5,
    "timestamp": "2024-01-15T09:00:00.000Z"
  }
}
```

## Error Responses

### Invalid Coordinates
```json
{
  "success": false,
  "message": "Invalid coordinates provided"
}
```

### Missing Location Data
```json
{
  "success": false,
  "message": "Location coordinates (latitude and longitude) are required for clock-in"
}
```

### Already Clocked In
```json
{
  "success": false,
  "message": "You have already clocked in today",
  "existing_record": { ... }
}
```

### No Active Clock-In
```json
{
  "success": false,
  "message": "No active clock-in record found for today. Please clock in first."
}
```

## Frontend Integration Example

```javascript
// Get user's current location
navigator.geolocation.getCurrentPosition(
  async (position) => {
    const { latitude, longitude } = position.coords;
    
    // Validate location first
    const validateResponse = await fetch('/api/validate-location', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ latitude, longitude })
    });
    
    if (validateResponse.ok) {
      // Proceed with clock-in
      const clockInResponse = await fetch('/api/clock-in', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          latitude,
          longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        })
      });
      
      const result = await clockInResponse.json();
      console.log('Clock-in result:', result);
    }
  },
  (error) => {
    console.error('Location error:', error);
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000
  }
);
```

## Notes

- All coordinates are validated to ensure they're within valid ranges
- Location updates are automatically created for both clock-in and clock-out
- Office location validation can be configured via environment variables
- Work duration is automatically calculated when clocking out
- Only one active clock-in record per day is allowed per employee