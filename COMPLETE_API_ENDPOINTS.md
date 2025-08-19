# Complete API Endpoints Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "department": "IT",
  "position": "Developer",
  "address": "123 Main St",
  "emergency_contact": "Jane Doe - 0987654321"
}
```

### Login
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Logout
- **POST** `/api/auth/logout`
- **Headers:** `Authorization: Bearer <token>`

---

## 👤 Employee Endpoints

### Get Current User Profile
- **GET** `/api/employees/profile`
- **Headers:** `Authorization: Bearer <token>`

### Update Current User Profile
- **PUT** `/api/employees/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "phone": "9876543210",
  "department": "Engineering",
  "position": "Senior Developer"
}
```

### Get All Employees (with pagination)
- **GET** `/api/employees?page=1&limit=10`
- **Headers:** `Authorization: Bearer <token>`

### Get Specific Employee
- **GET** `/api/employees/:id`
- **Headers:** `Authorization: Bearer <token>`

### Update Specific Employee (ownership required)
- **PUT** `/api/employees/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "department": "Technology",
  "position": "Lead Developer"
}
```

---

## ⏰ Attendance Endpoints

### Clock In
- **POST** `/api/attendance/clock-in`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "address": "Office Location",
  "accuracy": 10.5,
  "device_info": {
    "battery_level": 85,
    "is_mock_location": false
  }
}
```

### Clock Out
- **POST** `/api/attendance/clock-out`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "address": "Office Location",
  "accuracy": 10.5
}
```

### Get Current Attendance
- **GET** `/api/attendance/current/:employeeId`
- **Headers:** `Authorization: Bearer <token>`

### Get Attendance History
- **GET** `/api/attendance/history/:employeeId?page=1&limit=10`
- **Headers:** `Authorization: Bearer <token>`

---

## 🚶 Movement Endpoints

### Create Movement Record
- **POST** `/api/movements`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "from_latitude": 12.9716,
  "from_longitude": 77.5946,
  "to_latitude": 12.9720,
  "to_longitude": 77.5950,
  "movement_type": "walking",
  "distance": 100,
  "reason": "Meeting with client",
  "estimated_minutes": 5
}
```

### Get Movement History
- **GET** `/api/movements/history?page=1&limit=10&start_date=2024-01-01&end_date=2024-12-31`
- **Headers:** `Authorization: Bearer <token>`

### Get Movement History (Alternative endpoint)
- **GET** `/api/movements/history/current_user?page=1&limit=10&start_date=2024-01-01&end_date=2024-12-31`
- **Headers:** `Authorization: Bearer <token>`

### Get Active Movements
- **GET** `/api/movements/active`
- **Headers:** `Authorization: Bearer <token>`

### Get Movement by ID
- **GET** `/api/movements/:id`
- **Headers:** `Authorization: Bearer <token>`

### Update Movement
- **PUT** `/api/movements/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "reason": "Updated movement reason",
  "estimated_minutes": 10
}
```

---

## 📍 Location Endpoints

### Update Location
- **POST** `/api/location/update`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "accuracy": 10.5,
  "address": "Current Location"
}
```

### Validate Location
- **POST** `/api/location/validate`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "address": "Location to validate"
}
```

### Get Location History
- **GET** `/api/location/history?page=1&limit=10`
- **Headers:** `Authorization: Bearer <token>`

### Get Current Location
- **GET** `/api/location/current`
- **Headers:** `Authorization: Bearer <token>`

---

## 🔄 Backward Compatibility Aliases

### Validate Location (Alias)
- **POST** `/api/validate-location`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Same as `/api/location/validate`

### Clock In (Alias)
- **POST** `/api/clock-in`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Same as `/api/attendance/clock-in`

### Clock Status
- **GET** `/api/clock-status`
- **Headers:** `Authorization: Bearer <token>`

---

## 🏥 Health Check Endpoints

### Health Check
- **GET** `/health`

### API Health Check
- **GET** `/api/health`

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    // Array of items
  ],
  "pagination": {
    "total": 100,
    "totalPages": 10,
    "currentPage": 1,
    "limit": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## 🔒 Authentication Flow

1. **Register** a new user with `/api/auth/register`
2. **Login** with `/api/auth/login` to get a JWT token
3. **Include the token** in the Authorization header for all protected endpoints
4. **Logout** with `/api/auth/logout` when done

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- Pagination parameters: `page` (default: 1), `limit` (default: 10)
- Employee ID ownership is enforced for certain endpoints
- Location coordinates should be in decimal degrees format
- All endpoints return JSON responses
- Rate limiting is applied to all endpoints

---

## 🚨 Common Error Codes

- **400** - Bad Request (validation errors)
- **401** - Unauthorized (missing or invalid token)
- **403** - Forbidden (access denied, ownership check failed)
- **404** - Not Found (endpoint or resource not found)
- **409** - Conflict (duplicate email during registration)
- **429** - Too Many Requests (rate limit exceeded)
- **500** - Internal Server Error