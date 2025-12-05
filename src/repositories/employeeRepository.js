const { Op } = require('sequelize');
const { Employee } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

class EmployeeRepository {
  async create(employeeData) {
    try {
      console.log('Creating employee in PostgreSQL...');
      console.log('Employee data:', employeeData);

      const employee = await Employee.create(employeeData);
      console.log('Employee created successfully with ID:', employee.id);
      return employee;

    } catch (error) {
      console.error('Error creating employee:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        if (error.fields && error.fields.email) {
          throw new ApiError(409, 'Email already exists');
        }
        if (error.fields && error.fields.id) {
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
        where: { email: email.toLowerCase().trim() } 
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
      const employee = await Employee.findOne({ 
        where: { id: employeeId } 
      });
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

      const [affectedCount, updatedEmployees] = await Employee.update(
        { 
          ...updateData,
          updated_at: new Date()
        },
        { 
          where: { id: employeeId },
          returning: true // Get the updated record back
        }
      );

      if (affectedCount === 0) {
        throw new ApiError(404, 'Employee not found');
      }

      console.log('Employee updated successfully');
      return updatedEmployees[0]; // Return the updated employee

    } catch (error) {
      console.error('Error updating employee:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
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
        sort = [['created_at', 'DESC']]
      } = options;

      const offset = (page - 1) * limit;

      const { count, rows: data } = await Employee.findAndCountAll({
        where: filters,
        order: sort,
        offset: offset,
        limit: limit,
        attributes: { exclude: ['password'] } // Exclude password from results
      });

      const totalPages = Math.ceil(count / limit);
      
      return {
        data,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_records: count,
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
      const affectedCount = await Employee.destroy({
        where: { id: employeeId }
      });
      
      if (affectedCount === 0) {
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

      const [affectedCount, updatedEmployees] = await Employee.update(
        {
          password: hashedPassword,
          updated_at: new Date()
        },
        {
          where: { id: employeeId },
          returning: true
        }
      );

      if (affectedCount === 0) {
        throw new ApiError(404, 'Employee not found');
      }

      console.log('Employee password updated successfully');
      return updatedEmployees[0];

    } catch (error) {
      console.error('Error updating employee password:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Failed to update password: ${error.message}`);
    }
  }

  async updateResetToken(employeeId, resetToken, resetTokenExpiry) {
    try {
      console.log('Updating employee reset token:', employeeId);

      const [affectedCount, updatedEmployees] = await Employee.update(
        {
          reset_token: resetToken,
          reset_token_expiry: resetTokenExpiry,
          updated_at: new Date()
        },
        {
          where: { id: employeeId },
          returning: true
        }
      );

      if (affectedCount === 0) {
        throw new ApiError(404, 'Employee not found');
      }

      console.log('Employee reset token updated successfully');
      return updatedEmployees[0];

    } catch (error) {
      console.error('Error updating employee reset token:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Failed to update reset token: ${error.message}`);
    }
  }

  async findByResetToken(resetToken) {
    try {
      console.log('Finding employee by reset token');
      const employee = await Employee.findOne({
        where: {
          reset_token: resetToken,
          reset_token_expiry: { 
            [Op.gt]: new Date() // Token not expired
          }
        }
      });
      console.log('Employee found by reset token:', !!employee);
      return employee;

    } catch (error) {
      console.error('Error finding employee by reset token:', error);
      throw new ApiError(500, `Failed to find employee: ${error.message}`);
    }
  }

  async updatePasswordAndClearResetToken(employeeId, hashedPassword) {
    try {
      console.log('Updating employee password and clearing reset token:', employeeId);

      const [affectedCount, updatedEmployees] = await Employee.update(
        {
          password: hashedPassword,
          reset_token: null,
          reset_token_expiry: null,
          updated_at: new Date()
        },
        {
          where: { id: employeeId },
          returning: true
        }
      );

      if (affectedCount === 0) {
        throw new ApiError(404, 'Employee not found');
      }

      console.log('Employee password updated and reset token cleared successfully');
      return updatedEmployees[0];

    } catch (error) {
      console.error('Error updating employee password and clearing reset token:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Failed to update password and clear reset token: ${error.message}`);
    }
  }
}

module.exports = EmployeeRepository;