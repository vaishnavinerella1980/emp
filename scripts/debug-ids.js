const mongoose = require('mongoose');
const { sequelize } = require('../src/config/database');
const Employee = require('../src/models/sequelize/Employee');

const MONGODB_URI = 'mongodb+srv://vaishnavi:vaishnavi2002@cluster0.q29h1tu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const EmployeeSchema = new mongoose.Schema({}, { strict: false });
const MongoEmployee = mongoose.model('Employee', EmployeeSchema);

async function debugIDs() {
  try {
    await mongoose.connect(MONGODB_URI);
    await sequelize.authenticate();

    console.log('🔍 DEBUGGING ID MISMATCH:\n');

    // Get MongoDB employees
    const mongoEmployees = await MongoEmployee.find({});
    console.log('MongoDB Employees:');
    mongoEmployees.forEach(emp => {
      console.log(`  ID: ${emp.id}, Name: ${emp.name}, Email: ${emp.email}`);
    });

    console.log('\nPostgreSQL Employees:');
    const pgEmployees = await Employee.findAll();
    pgEmployees.forEach(emp => {
      console.log(`  ID: ${emp.id}, Name: ${emp.name}, Email: ${emp.email}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    await sequelize.close();
    process.exit(0);
  }
}

debugIDs();