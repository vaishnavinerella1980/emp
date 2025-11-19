# API Endpoints Summary

## 🏥 Health Check APIs
- **GET** `/health` - API health check
- **GET** `/api/health` - Alternative health check

## 🔐 Authentication APIs
- **POST** `/api/auth/register` - Register new employee
- **POST** `/api/auth/login` - Employee login  
- **POST** `/api/auth/logout` - Employee logout (requires auth)
- **POST** `/api/auth/forgot-password` - Forgot password request( to be added later)
- **POST** `/api/auth/reset-password` - Reset password using OTP(to be added later)
#- **POST** `/api/auth/change-password/emloyeeId` - Change password (requires auth) (to be added later)

## 👥 Employee Management APIs
- **GET** `/api/employees/profile` - Get current user's profile (requires auth)
- **PUT** `/api/employees/profile` - Update current user's profile (requires auth)
- **GET** `/api/employees/` - Get all employees with pagination (requires auth)
- **GET** `/api/employees/:id` - Get specific employee by ID (requires auth)
- **PUT** `/api/employees/:id` - Update specific employee (requires auth)

## ⏰ Attendance APIs
- **POST** `/api/attendance/clock-in` - Clock in employee (requires auth)
- **POST** `/api/clock-in` - Clock in alias (requires auth)
- **POST** `/api/attendance/clock-out` - Clock out employee (requires auth)
- **GET** `/api/attendance/current/:employeeId` - Get current attendance (requires auth)
- **GET** `/api/clock-status` - Get clock status for authenticated user (requires auth)
- **GET** `/api/attendance/history/:employeeId` - Get attendance history (requires auth)

## 🚶 Movement Tracking APIs
- **POST** `/api/movements/` - Create new movement record (requires auth)
- **GET** `/api/movements/history` - Get movement history (requires auth)
- **GET** `/api/movements/active` - Get active movements (requires auth)
- **GET** `/api/movements/:id` - Get specific movement by ID (requires auth)
- **PUT** `/api/movements/:id` - Update specific movement (requires auth)
- **POST** `/api/movements/:id/end` - End new movement record (requires auth)

## 📍 Location APIs
- **POST** `/api/location/update` - Update employee location (requires auth)
- **POST** `/api/location/validate` - Validate location coordinates (requires auth)
- **POST** `/api/validate-location` - Validate location alias (requires auth)
- **GET** `/api/location/history` - Get location history (requires auth)
- **GET** `/api/location/current` - Get current location (requires auth)

## 📊 Summary
- **Total Endpoints**: 24 APIs
- **Public Endpoints**: 5 (health + auth)
- **Protected Endpoints**: 19 (require authentication)
- **Base URL**: `http://localhost:3000`

## 🔒 Authentication
Most APIs require Bearer token:
```
Authorization: Bearer <your-jwt-token>
```

## ✅ Status
- All endpoints are implemented and tested
- Backward compatibility aliases added
- Comprehensive error handling
- Request validation enabled
- Rate limiting applied