# Complete API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
Most endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🏥 Health Check APIs

### GET /health
- **Description**: Check API health status
- **Authentication**: None required
- **Response**: 
```json
{
  "success": true,
  "message": "API is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

### GET /api/health
- **Description**: Alternative health check endpoint
- **Authentication**: None required
- **Response**: Same as `/health`

---

## 🔐 Authentication APIs

### POST /api/auth/register
- **Description**: Register a new employee
- **Authentication**: None required
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "department": "IT",
  "position": "Developer",
  "address": "123 Main St",
  "emergency_contact": {
    "name": "Jane Doe",
    "phone": "0987654321"
  }
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "employee": { ... },
    "message": "Employee registered successfully"
  },
  "message": "Registration successful"
}
```

### POST /api/auth/login
- **Description**: Employee login
- **Authentication**: None required
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "employee": { ... },
    "message": "Login successful"
  }
}
```

### POST /api/auth/logout
- **Description**: Employee logout
- **Authentication**: Required
- **Response**:
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## 👥 Employee Management APIs

### GET /api/employees/profile
- **Description**: Get current user's profile
- **Authentication**: Required
- **Response**:
```json
{
  "success": true,
  "message": "Profile endpoint working",
  "user": { ... }
}
```

### PUT /api/employees/profile
- **Description**: Update current user's profile
- **Authentication**: Required
- **Request Body**: Profile data to update
- **Response**:
```json
{
  "success": true,
  "message": "Update profile endpoint working",
  "data": { ... }
}
```

### GET /api/employees
- **Description**: Get all employees with pagination
- **Authentication**: Required
- **Query Parameters**:
  - `page` (optional): Page number
  - `limit` (optional): Items per page
- **Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalRecords": 2
  }
}
```

### GET /api/employees/:id
- **Description**: Get specific employee by ID
- **Authentication**: Required
- **Parameters**: `id` - Employee ID
- **Response**:
```json
{
  "success": true,
  "data": { ... }
}
```

### PUT /api/employees/:id
- **Description**: Update specific employee
- **Authentication**: Required (with ownership check)
- **Parameters**: `id` - Employee ID
- **Request Body**: Employee data to update
- **Response**:
```json
{
  "success": true,
  "data": { ... }
}
```

---

## ⏰ Attendance APIs

### POST /api/attendance/clock-in
### POST /api/clock-in (Alias)
- **Description**: Clock in employee
- **Authentication**: Required
- **Request Body**:
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
- **Response**:
```json
{
  "success": true,
  "data": {
    "attendance": { ... },
    "message": "Successfully clocked in"
  }
}
```

### POST /api/attendance/clock-out
- **Description**: Clock out employee
- **Authentication**: Required
- **Request Body**:
```json
{
  "attendanceId": "attendance-id",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "address": "Office Location"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "attendance": { ... },
    "message": "Successfully clocked out"
  }
}
```

### GET /api/attendance/current/:employeeId
- **Description**: Get current attendance for specific employee
- **Authentication**: Required
- **Parameters**: `employeeId` - Employee ID
- **Response**:
```json
{
  "success": true,
  "data": {
    "attendance": { ... },
    "message": "Current attendance retrieved"
  }
}
```

### GET /api/clock-status
- **Description**: Get clock status for authenticated user
- **Authentication**: Required
- **Response**:
```json
{
  "success": true,
  "data": {
    "attendance": { ... },
    "isClockedIn": true,
    "message": "Employee is currently clocked in"
  }
}
```

### GET /api/attendance/history/:employeeId
- **Description**: Get attendance history for employee
- **Authentication**: Required
- **Parameters**: `employeeId` - Employee ID
- **Query Parameters**:
  - `startDate` (optional): Start date filter
  - `endDate` (optional): End date filter
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 50)
- **Response**:
```json
{
  "success": true,
  "data": {
    "attendance": [...],
    "pagination": { ... }
  }
}
```

---

## 🚶 Movement Tracking APIs

### POST /api/movements
- **Description**: Create new movement record
- **Authentication**: Required
- **Request Body**:
```json
{
  "from_latitude": 12.9716,
  "from_longitude": 77.5946,
  "to_latitude": 12.9720,
  "to_longitude": 77.5950,
  "movement_type": "walking",
  "distance": 100
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "movement": { ... }
  },
  "message": "Movement record created successfully"
}
```

### GET /api/movements/history
- **Description**: Get movement history with pagination
- **Authentication**: Required
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `startDate` (optional): Start date filter
  - `endDate` (optional): End date filter
- **Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": { ... }
}
```

### GET /api/movements/active
- **Description**: Get active movements
- **Authentication**: Required
- **Response**:
```json
{
  "success": true,
  "data": {
    "movements": [...]
  }
}
```

### GET /api/movements/:id
- **Description**: Get specific movement by ID
- **Authentication**: Required
- **Parameters**: `id` - Movement ID
- **Response**:
```json
{
  "success": true,
  "data": {
    "movement": { ... }
  }
}
```

### PUT /api/movements/:id
- **Description**: Update specific movement
- **Authentication**: Required
- **Parameters**: `id` - Movement ID
- **Request Body**: Movement data to update
- **Response**:
```json
{
  "success": true,
  "data": {
    "movement": { ... }
  }
}
```

---

## 📍 Location APIs

### POST /api/location/update
- **Description**: Update employee location
- **Authentication**: Required
- **Request Body**:
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "accuracy": 10.5,
  "address": "Current Location"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "location": { ... }
  },
  "message": "Location updated successfully"
}
```

### POST /api/location/validate
### POST /api/validate-location (Alias)
- **Description**: Validate location coordinates
- **Authentication**: Required
- **Request Body**:
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "withinOfficeRadius": true
  },
  "message": "Location validated successfully"
}
```

### GET /api/location/history
- **Description**: Get location history with pagination
- **Authentication**: Required
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 100)
  - `startDate` (optional): Start date filter
  - `endDate` (optional): End date filter
- **Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": { ... }
}
```

### GET /api/location/current
- **Description**: Get current location for authenticated user
- **Authentication**: Required
- **Response**:
```json
{
  "success": true,
  "data": {
    "location": { ... }
  },
  "message": "Current location retrieved successfully"
}
```

---

## 📊 API Summary

### Total Endpoints: 24
- **Health Check**: 2 endpoints
- **Authentication**: 3 endpoints
- **Employee Management**: 5 endpoints
- **Attendance**: 5 endpoints (including aliases)
- **Movement Tracking**: 5 endpoints
- **Location**: 4 endpoints (including aliases)

### Authentication Requirements
- **Public Endpoints**: 5 (health checks + auth register/login)
- **Protected Endpoints**: 19 (require Bearer token)

### HTTP Methods Used
- **GET**: 12 endpoints
- **POST**: 9 endpoints
- **PUT**: 3 endpoints

### Features
- ✅ JWT Authentication
- ✅ Request Validation
- ✅ Error Handling
- ✅ Rate Limiting
- ✅ CORS Support
- ✅ Pagination Support
- ✅ Comprehensive Logging

### Alias Routes (for backward compatibility)
- `/api/clock-in` → `/api/attendance/clock-in`
- `/api/validate-location` → `/api/location/validate`
- `/api/clock-status` → New dedicated endpoint

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error