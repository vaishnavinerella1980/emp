# Clock In/Out API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
All clock endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Clock In API

### Endpoint
```
POST /api/clock-in
```

### Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### Request Body
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "address": "Office Location",
  "accuracy": 10.5,
  "timestamp": "2025-08-05T12:00:00.000Z",
  "device_info": {
    "battery_level": 85,
    "is_mock_location": false
  }
}
```

### Required Fields
- `latitude` (number): GPS latitude coordinate (-90 to 90)
- `longitude` (number): GPS longitude coordinate (-180 to 180)

### Optional Fields
- `address` (string): Human-readable address
- `accuracy` (number): GPS accuracy in meters
- `timestamp` (string): ISO timestamp (defaults to current time)
- `device_info` (object): Device information

### Success Response (201)
```json
{
  "success": true,
  "message": "Successfully clocked in",
  "record": {
    "id": "1754383369611_f4621faf",
    "employee_id": "1754383369315_272336f8",
    "login_time": "2025-08-05T12:00:00.000Z",
    "login_latitude": 12.9716,
    "login_longitude": 77.5946,
    "login_address": "Office Location",
    "status": "active",
    "reason": "Regular Work"
  },
  "location": {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "address": "Office Location",
    "accuracy": 10.5
  },
  "clock_in_time": "2025-08-05T12:00:00.000Z",
  "timestamp": "2025-08-05T12:00:00.000Z"
}
```

### Error Responses

#### 400 - Missing Coordinates
```json
{
  "success": false,
  "message": "Location coordinates (latitude and longitude) are required for clock-in"
}
```

#### 400 - Invalid Coordinates
```json
{
  "success": false,
  "message": "Invalid coordinates provided"
}
```

#### 409 - Already Clocked In
```json
{
  "success": false,
  "message": "You have already clocked in today",
  "existing_record": { ... }
}
```

---

## 2. Clock Out API

### Endpoint
```
POST /api/clock-out
```

### Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### Request Body
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "address": "Office Location",
  "accuracy": 10.5,
  "timestamp": "2025-08-05T18:00:00.000Z",
  "device_info": {
    "battery_level": 75,
    "is_mock_location": false
  }
}
```

### Required Fields
- `latitude` (number): GPS latitude coordinate (-90 to 90)
- `longitude` (number): GPS longitude coordinate (-180 to 180)

### Optional Fields
- `address` (string): Human-readable address
- `accuracy` (number): GPS accuracy in meters
- `timestamp` (string): ISO timestamp (defaults to current time)
- `device_info` (object): Device information

### Success Response (200)
```json
{
  "success": true,
  "message": "Successfully clocked out",
  "record": {
    "id": "1754383369611_f4621faf",
    "employee_id": "1754383369315_272336f8",
    "login_time": "2025-08-05T12:00:00.000Z",
    "logout_time": "2025-08-05T18:00:00.000Z",
    "login_latitude": 12.9716,
    "login_longitude": 77.5946,
    "logout_latitude": 12.9716,
    "logout_longitude": 77.5946,
    "status": "completed",
    "login_address": "Office Location",
    "logout_address": "Office Location",
    "reason": "Regular Work"
  },
  "location": {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "address": "Office Location",
    "accuracy": 10.5
  },
  "clock_out_time": "2025-08-05T18:00:00.000Z",
  "work_duration": {
    "hours": 6,
    "minutes": 0,
    "total_minutes": 360,
    "formatted": "6h 0m"
  }
}
```

### Error Responses

#### 400 - Missing Coordinates
```json
{
  "success": false,
  "message": "Location coordinates (latitude and longitude) are required for clock-out"
}
```

#### 404 - No Active Clock-In
```json
{
  "success": false,
  "message": "No active clock-in record found for today. Please clock in first."
}
```

---

## 3. Check Clock Status API

### Endpoint
```
GET /api/clock-status
```

### Headers
```
Authorization: Bearer <jwt_token>
```

### Success Response (200)
```json
{
  "success": true,
  "is_clocked_in": true,
  "record": {
    "id": "1754383369611_f4621faf",
    "employee_id": "1754383369315_272336f8",
    "login_time": "2025-08-05T12:00:00.000Z",
    "logout_time": null,
    "status": "active",
    "login_address": "Office Location"
  },
  "work_duration": {
    "hours": 2,
    "minutes": 30,
    "total_minutes": 150
  },
  "status": "active"
}
```

---

## JavaScript Examples

### Clock In Example
```javascript
async function clockIn() {
    try {
        // Get current location
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            });
        });

        const response = await fetch('http://localhost:3000/api/clock-in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                address: 'Current Location',
                timestamp: new Date().toISOString(),
                device_info: {
                    battery_level: 85,
                    is_mock_location: false
                }
            })
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('Clock-in successful:', data);
        } else {
            console.error('Clock-in failed:', data.message);
        }
    } catch (error) {
        console.error('Clock-in error:', error);
    }
}
```

### Clock Out Example
```javascript
async function clockOut() {
    try {
        // Get current location
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            });
        });

        const response = await fetch('http://localhost:3000/api/clock-out', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                address: 'Current Location',
                timestamp: new Date().toISOString(),
                device_info: {
                    battery_level: 75,
                    is_mock_location: false
                }
            })
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('Clock-out successful:', data);
            console.log('Work duration:', data.work_duration.formatted);
        } else {
            console.error('Clock-out failed:', data.message);
        }
    } catch (error) {
        console.error('Clock-out error:', error);
    }
}
```

---

## Common Error Codes

- **400**: Bad Request (missing or invalid data)
- **401**: Unauthorized (missing or invalid token)
- **403**: Forbidden (token expired)
- **404**: Not Found (no active clock-in record for clock-out)
- **409**: Conflict (already clocked in)
- **500**: Internal Server Error

---

## Notes

1. **Location Required**: Both clock-in and clock-out require GPS coordinates
2. **One Clock-In Per Day**: Employees can only clock in once per day
3. **Must Clock In First**: Clock-out requires an active clock-in record
4. **Automatic Location Logging**: Location updates are automatically saved
5. **Work Duration**: Calculated automatically on clock-out
6. **Time Zones**: All timestamps are in ISO format (UTC)