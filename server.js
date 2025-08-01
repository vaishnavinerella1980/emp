const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// In-memory storage
const storage = {
  employees: [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@company.com',
      phone: '+1-555-0123',
      department: 'Engineering',
      position: 'Software Developer',
      address: '123 Main St, City, State 12345',
      emergency_contact: '+1-555-0124',
      profile_image: '',
      password: '123456'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      phone: '+1-555-0125',
      department: 'Human Resources',
      position: 'HR Manager',
      address: '456 Oak Ave, City, State 12345',
      emergency_contact: '+1-555-0126',
      profile_image: '',
      password: 'password'
    },
    {
      id: '3',
      name: 'Admin User',
      email: 'admin@company.com',
      phone: '+1-555-0129',
      department: 'Administration',
      position: 'System Administrator',
      address: '321 Admin Blvd, City, State 12345',
      emergency_contact: '+1-555-0130',
      profile_image: '',
      password: 'admin123'
    }
  ],
  attendanceRecords: [],
  movementRecords: [],
  locationUpdates: [],
  sessions: []
};

// CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

// Helper functions
const generateId = () => `${Date.now()}_${uuidv4().slice(0, 8)}`;
const sanitizeEmployee = (employee) => {
  const { password, ...sanitized } = employee;
  return sanitized;
};

// Routes
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const employee = storage.employees.find(emp => emp.email.toLowerCase() === email.toLowerCase());
    if (!employee || employee.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { employeeId: employee.id, email: employee.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    storage.sessions.push({
      employee_id: employee.id,
      token: token,
      created_at: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      employee: sanitizeEmployee(employee)
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    storage.sessions = storage.sessions.filter(s => s.token !== token);
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Employee routes
app.get('/api/employees/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const employee = storage.employees.find(emp => emp.id === id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      employee: sanitizeEmployee(employee)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/api/employees', authenticateToken, (req, res) => {
  try {
    const sanitizedEmployees = storage.employees.map(sanitizeEmployee);
    
    res.json({
      success: true,
      employees: sanitizedEmployees,
      total: sanitizedEmployees.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Attendance routes
app.post('/api/attendance', authenticateToken, (req, res) => {
  try {
    const attendanceData = req.body;
    const employeeId = req.user.employeeId;

    const record = {
      id: attendanceData.id || generateId(),
      employee_id: employeeId,
      login_time: attendanceData.login_time || new Date().toISOString(),
      logout_time: attendanceData.logout_time || null,
      login_latitude: parseFloat(attendanceData.login_latitude),
      login_longitude: parseFloat(attendanceData.login_longitude),
      logout_latitude: attendanceData.logout_latitude ? parseFloat(attendanceData.logout_latitude) : null,
      logout_longitude: attendanceData.logout_longitude ? parseFloat(attendanceData.logout_longitude) : null,
      status: attendanceData.status || 'active',
      login_address: attendanceData.login_address || '',
      logout_address: attendanceData.logout_address || null,
      reason: attendanceData.reason || 'Regular Work'
    };

    storage.attendanceRecords.push(record);

    res.status(201).json({
      success: true,
      message: 'Attendance record created successfully',
      record: record
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.put('/api/attendance/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const attendanceData = req.body;
    const employeeId = req.user.employeeId;

    const recordIndex = storage.attendanceRecords.findIndex(r => r.id === id && r.employee_id === employeeId);
    
    if (recordIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    const record = storage.attendanceRecords[recordIndex];
    if (attendanceData.logout_time) record.logout_time = attendanceData.logout_time;
    if (attendanceData.logout_latitude) record.logout_latitude = parseFloat(attendanceData.logout_latitude);
    if (attendanceData.logout_longitude) record.logout_longitude = parseFloat(attendanceData.logout_longitude);
    if (attendanceData.status) record.status = attendanceData.status;
    if (attendanceData.logout_address) record.logout_address = attendanceData.logout_address;
    if (attendanceData.reason) record.reason = attendanceData.reason;

    storage.attendanceRecords[recordIndex] = record;

    res.json({
      success: true,
      message: 'Attendance record updated successfully',
      record: record
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/api/attendance/employee/:employeeId', authenticateToken, (req, res) => {
  try {
    const { employeeId } = req.params;
    const requestingEmployeeId = req.user.employeeId;

    if (employeeId !== requestingEmployeeId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const records = storage.attendanceRecords
      .filter(r => r.employee_id === employeeId)
      .sort((a, b) => new Date(b.login_time) - new Date(a.login_time));

    res.json({
      success: true,
      records: records,
      total: records.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Movement routes
app.post('/api/movements', authenticateToken, (req, res) => {
  try {
    const movementData = req.body;
    const employeeId = req.user.employeeId;

    const record = {
      id: movementData.id || generateId(),
      employee_id: employeeId,
      timestamp: movementData.timestamp || new Date().toISOString(),
      latitude: parseFloat(movementData.latitude),
      longitude: parseFloat(movementData.longitude),
      reason: movementData.reason || 'General Movement',
      estimated_minutes: parseInt(movementData.estimated_minutes) || 0,
      status: movementData.status || 'active',
      address: movementData.address || '',
      return_time: movementData.return_time || null
    };

    storage.movementRecords.push(record);

    res.status(201).json({
      success: true,
      message: 'Movement record created successfully',
      record: record
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.put('/api/movements/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const movementData = req.body;
    const employeeId = req.user.employeeId;

    const recordIndex = storage.movementRecords.findIndex(r => r.id === id && r.employee_id === employeeId);
    
    if (recordIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Movement record not found'
      });
    }

    const record = storage.movementRecords[recordIndex];
    if (movementData.return_time) record.return_time = movementData.return_time;
    if (movementData.status) record.status = movementData.status;

    storage.movementRecords[recordIndex] = record;

    res.json({
      success: true,
      message: 'Movement record updated successfully',
      record: record
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/api/movements/employee/:employeeId', authenticateToken, (req, res) => {
  try {
    const { employeeId } = req.params;
    const requestingEmployeeId = req.user.employeeId;

    if (employeeId !== requestingEmployeeId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const records = storage.movementRecords
      .filter(r => r.employee_id === employeeId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      records: records,
      total: records.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Location tracking
app.post('/api/location-updates', authenticateToken, (req, res) => {
  try {
    const locationData = req.body;
    const employeeId = req.user.employeeId;

    const record = {
      id: generateId(),
      employee_id: employeeId,
      latitude: parseFloat(locationData.latitude),
      longitude: parseFloat(locationData.longitude),
      timestamp: locationData.timestamp || new Date().toISOString(),
      accuracy: locationData.accuracy ? parseFloat(locationData.accuracy) : null,
      altitude: locationData.altitude ? parseFloat(locationData.altitude) : null,
      heading: locationData.heading ? parseFloat(locationData.heading) : null,
      speed: locationData.speed ? parseFloat(locationData.speed) : null
    };

    storage.locationUpdates.push(record);

    // Keep only last 1000 updates per employee
    const employeeUpdates = storage.locationUpdates
      .filter(u => u.employee_id === employeeId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
    if (employeeUpdates.length > 1000) {
      const toKeep = employeeUpdates.slice(0, 1000);
      storage.locationUpdates = storage.locationUpdates
        .filter(u => u.employee_id !== employeeId)
        .concat(toKeep);
    }

    res.json({
      success: true,
      message: 'Location update received successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/api/location-updates/employee/:employeeId', authenticateToken, (req, res) => {
  try {
    const { employeeId } = req.params;
    const requestingEmployeeId = req.user.employeeId;
    const { limit = 100, offset = 0 } = req.query;

    if (employeeId !== requestingEmployeeId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const allUpdates = storage.locationUpdates
      .filter(u => u.employee_id === employeeId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
    const total = allUpdates.length;
    const updates = allUpdates.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      updates: updates,
      total: total
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log('📚 Demo: john.doe@company.com / 123456');
});