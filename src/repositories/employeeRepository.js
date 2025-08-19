const Employee = require('../models/Employee');
const { ApiError } = require('../middleware/errorHandler');

class EmployeeRepository {
  async create(employeeData) {
    try {
      console.log('Creating employee in database...');
      console.log('Employee data to be saved:', employeeData); // Debugging log
      const employee = new Employee(employeeData);
      const savedEmployee = await employee.save();
      console.log('Employee saved successfully');
      return savedEmployee;
    } catch (error) {
      console.error('Error creating employee:', error);
      if (error.code === 11000) {
        // Handle duplicate email
        if (error.keyPattern?.email) {
          throw new ApiError(409, 'Email already exists');
        }
        if (error.keyPattern?.id) {
          throw new ApiError(409, 'Employee ID already exists');
        }
      }
      throw new ApiError(500, `Failed to create employee: ${error.message}`);
    }
  }

  async findByEmail(email) {
    try {
      console.log('Finding employee by email:', email);
      const employee = await Employee.findOne({ 
        email: email.toLowerCase().trim() 
      });
      console.log('Employee found by email:', !!employee);
      return employee;
    } catch (error) {
      console.error('Error finding employee by email:', error);
      throw new ApiError(500, `Failed to find employee: ${error.message}`);
    }
  }

  async findById(employeeId) {
    try {
      console.log('Finding employee by ID:', employeeId);
      const employee = await Employee.findOne({ id: employeeId });
      console.log('Employee found by ID:', !!employee);
      return employee;
    } catch (error) {
      console.error('Error finding employee by ID:', error);
      throw new ApiError(500, `Failed to find employee: ${error.message}`);
    }
  }

  async update(employeeId, updateData) {
    try {
      console.log('Updating employee:', employeeId);
      console.log('Update data:', updateData);

      const employee = await Employee.findOneAndUpdate(
        { id: employeeId },
        { 
          $set: {
            ...updateData,
            updated_at: new Date().toISOString()
          }
        },
        { new: true, runValidators: true }
      );

      if (!employee) {
        throw new ApiError(404, 'Employee not found');
      }

      console.log('Employee updated successfully');
      return employee;
    } catch (error) {
      console.error('Error updating employee:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      if (error.code === 11000) {
        throw new ApiError(409, 'Email already exists');
      }
      throw new ApiError(500, `Failed to update employee: ${error.message}`);
    }
  }

  async findAll(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        sort = { created_at: -1 }
      } = options;

      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        Employee.find(filters)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .select('-password'), // Exclude password from results
        Employee.countDocuments(filters)
      ]);

      const totalPages = Math.ceil(total / limit);
      
      return {
        data,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_records: total,
          records_per_page: limit,
          has_next_page: page < totalPages,
          has_prev_page: page > 1
        }
      };
    } catch (error) {
      console.error('Error finding employees:', error);
      throw new ApiError(500, `Failed to find employees: ${error.message}`);
    }
  }

  async delete(employeeId) {
    try {
      console.log('Deleting employee:', employeeId);
      const result = await Employee.deleteOne({ id: employeeId });
      
      if (result.deletedCount === 0) {
        throw new ApiError(404, 'Employee not found');
      }

      console.log('Employee deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting employee:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Failed to delete employee: ${error.message}`);
    }
  }

  async updatePassword(employeeId, hashedPassword) {
    try {
      console.log('Updating employee password:', employeeId);
      
      const employee = await Employee.findOneAndUpdate(
        { id: employeeId },
        { 
          $set: {
            password: hashedPassword,
            updated_at: new Date().toISOString()
          }
        },
        { new: true }
      );

      if (!employee) {
        throw new ApiError(404, 'Employee not found');
      }

      console.log('Employee password updated successfully');
      return employee;
    } catch (error) {
      console.error('Error updating employee password:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Failed to update password: ${error.message}`);
    }
  }
}

module.exports = EmployeeRepository;