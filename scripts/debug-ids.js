const { sequelize } = require('../src/config/database');
const Employee = require('../src/models/sequelize/Employee');

async function debugPostgreSQLData() {
  try {
    console.log('🔍 DEBUGGING POSTGRESQL DATA:\n');

    // Connect to PostgreSQL
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected\n');

    // Get PostgreSQL employees
    const pgEmployees = await Employee.findAll();
    console.log('PostgreSQL Employees:');
    pgEmployees.forEach(emp => {
      console.log(`  ID: ${emp.id}, Name: ${emp.name}, Email: ${emp.email}`);
    });

    // Additional debugging info
    console.log(`\n📊 Total Employees: ${pgEmployees.length}`);

    if (pgEmployees.length > 0) {
      console.log('\n📋 Sample Employee Details:');
      pgEmployees.slice(0, 3).forEach(emp => {
        console.log(`   - ID: ${emp.id}`);
        console.log(`     Name: ${emp.name}`);
        console.log(`     Email: ${emp.email}`);
        console.log(`     Created: ${emp.created_at}`);
        console.log(`     Updated: ${emp.updated_at}\n`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 PostgreSQL connection closed');
    process.exit(0);
  }
}

debugPostgreSQLData();
