const Employee = require('../models/Employee');

class EmployeeRepository {
  async findById(id) {
    return await Employee.findOne({ id, is_active: true });
  }

  async findByEmail(email) {
    return await Employee.findOne({ email: email.toLowerCase(), is_active: true });
  }

  async create(employeeData) {
    const employee = new Employee(employeeData);
    return await employee.save();
  }

  async update(id, updateData) {
    return await Employee.findOneAndUpdate(
      { id },
      { ...updateData, updated_at: new Date().toISOString() },
      { new: true }
    );
  }

  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;
    
    const query = Employee.find({ ...filters, is_active: true });
    const total = await Employee.countDocuments({ ...filters, is_active: true });
    
    const employees = await query
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .select('-password');

    return { employees, total, page, limit };
  }

  async softDelete(id) {
    return await Employee.findOneAndUpdate(
      { id },
      { is_active: false, updated_at: new Date().toISOString() },
      { new: true }
    );
  }

  async count(filters = {}) {
    return await Employee.countDocuments({ ...filters, is_active: true });
  }
}

module.exports = EmployeeRepository;