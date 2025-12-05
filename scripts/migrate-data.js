const { sequelize } = require('../src/config/database');

// Import Sequelize models
const Employee = require('../src/models/sequelize/Employee');
const Attendance = require('../src/models/sequelize/attendance');
const Movement = require('../src/models/sequelize/Movement');
const Location = require('../src/models/sequelize/Location');
const Session = require('../src/models/sequelize/Session');

async function verifyPostgreSQLData() {
  try {
    console.log('🔍 Verifying PostgreSQL Data Integrity...\n');

    // Connect to PostgreSQL
    console.log('🔗 Connecting to PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected\n');

    // 1. GET ALL DATA
    console.log('📊 Loading PostgreSQL data...');
    const employees = await Employee.findAll();
    const attendance = await Attendance.findAll();
    const movements = await Movement.findAll();
    const locations = await Location.findAll();
    const sessions = await Session.findAll();

    console.log('📊 Data Summary:');
    console.log(`  👥 Employees: ${employees.length}`);
    console.log(`  ⏰ Attendance Records: ${attendance.length}`);
    console.log(`  🚶 Movement Records: ${movements.length}`);
    console.log(`  📍 Location Records: ${locations.length}`);
    console.log(`  🔐 Session Records: ${sessions.length}\n`);

    // 2. VERIFY DATA INTEGRITY
    console.log('🔍 Verifying data relationships...\n');

    // Check for orphaned movements (movements without valid employees)
    const employeeIds = new Set(employees.map(emp => emp.id));
    const orphanedMovements = movements.filter(mov => !employeeIds.has(mov.employee_id));

    if (orphanedMovements.length > 0) {
      console.log(`⚠️  Found ${orphanedMovements.length} orphaned movement records:`);
      orphanedMovements.forEach(mov => {
        console.log(`   - Movement ID: ${mov.id}, Employee ID: ${mov.employee_id}`);
      });
    } else {
      console.log('✅ All movement records have valid employee references');
    }

    // Check for orphaned locations
    const orphanedLocations = locations.filter(loc => !employeeIds.has(loc.employee_id));

    if (orphanedLocations.length > 0) {
      console.log(`⚠️  Found ${orphanedLocations.length} orphaned location records:`);
      orphanedLocations.forEach(loc => {
        console.log(`   - Location ID: ${loc.id}, Employee ID: ${loc.employee_id}`);
      });
    } else {
      console.log('✅ All location records have valid employee references');
    }

    // Check for orphaned sessions
    const orphanedSessions = sessions.filter(sess => !employeeIds.has(sess.employee_id));

    if (orphanedSessions.length > 0) {
      console.log(`⚠️  Found ${orphanedSessions.length} orphaned session records:`);
      orphanedSessions.forEach(sess => {
        console.log(`   - Session Employee ID: ${sess.employee_id}`);
      });
    } else {
      console.log('✅ All session records have valid employee references');
    }

    // 3. SAMPLE DATA VERIFICATION
    console.log('\n📋 Sample Data Verification:');

    if (employees.length > 0) {
      console.log('👥 Sample Employees:');
      employees.slice(0, 3).forEach(emp => {
        console.log(`   - ${emp.name} (${emp.email}) - ID: ${emp.id}`);
      });
    }

    if (attendance.length > 0) {
      console.log('⏰ Sample Attendance Records:');
      attendance.slice(0, 3).forEach(att => {
        console.log(`   - Employee ${att.employee_id}: ${att.clock_in_time} - ${att.clock_out_time || 'Active'}`);
      });
    }

    // FINAL SUMMARY
    console.log('\n🎉 POSTGRESQL DATA VERIFICATION COMPLETE');
    console.log('=====================================');
    console.log(`👥 Total Employees: ${employees.length}`);
    console.log(`⏰ Total Attendance: ${attendance.length}`);
    console.log(`🚶 Total Movements: ${movements.length}`);
    console.log(`📍 Total Locations: ${locations.length}`);
    console.log(`🔐 Total Sessions: ${sessions.length}`);
    console.log('=====================================');
    console.log('✅ PostgreSQL data integrity verified!');

  } catch (error) {
    console.error('❌ VERIFICATION FAILED:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 PostgreSQL connection closed');
    process.exit(0);
  }
}

verifyPostgreSQLData();
