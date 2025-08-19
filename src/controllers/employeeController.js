class EmployeeController {
  constructor() {
    console.log('EmployeeController instantiated');
  }

  // Get current user's profile
  getProfile = (req, res) => {
    try {
      console.log('getProfile called');
      res.json({ 
        success: true, 
        message: 'Profile endpoint working',
        user: req.user || 'No user data' 
      });
    } catch (error) {
      console.error('getProfile error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Update current user's profile
  updateProfile = (req, res) => {
    try {
      console.log('updateProfile called');
      res.json({ 
        success: true, 
        message: 'Update profile endpoint working',
        data: req.body 
      });
    } catch (error) {
      console.error('updateProfile error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Get all employees (with pagination)
  getAllEmployees = (req, res) => {
    try {
      console.log('getAllEmployees called');
      console.log('Query params:', req.query);
      
      // Mock data for testing
      const mockEmployees = [
        { id: 1, name: 'John Doe', department: 'IT' },
        { id: 2, name: 'Jane Smith', department: 'HR' }
      ];

      res.json({
        success: true,
        data: mockEmployees,
        message: 'Get all employees working',
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalRecords: 2
        }
      });
    } catch (error) {
      console.error('getAllEmployees error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Get single employee by ID
  getEmployee = (req, res) => {
    try {
      console.log('getEmployee called with ID:', req.params.id);
      res.json({ 
        success: true, 
        message: 'Get employee endpoint working',
        data: { id: req.params.id, name: 'Test Employee' }
      });
    } catch (error) {
      console.error('getEmployee error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Update employee by ID
  updateEmployee = (req, res) => {
    try {
      console.log('updateEmployee called with ID:', req.params.id);
      res.json({ 
        success: true, 
        message: 'Update employee endpoint working',
        data: { id: req.params.id, ...req.body }
      });
    } catch (error) {
      console.error('updateEmployee error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}

module.exports = EmployeeController;