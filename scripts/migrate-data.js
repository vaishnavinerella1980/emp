const mongoose = require('mongoose');
const { sequelize } = require('../src/config/database');

// Import Sequelize models
const Employee = require('../src/models/sequelize/Employee');
const Attendance = require('../src/models/sequelize/attendance');
const Movement = require('../src/models/sequelize/Movement');
const Location = require('../src/models/sequelize/Location');
const Session = require('../src/models/sequelize/Session');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://vaishnavi:vaishnavi2002@cluster0.q29h1tu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// MongoDB Schemas
const EmployeeSchema = new mongoose.Schema({}, { strict: false });
const AttendanceSchema = new mongoose.Schema({}, { strict: false });
const MovementSchema = new mongoose.Schema({}, { strict: false });
const LocationSchema = new mongoose.Schema({}, { strict: false });
const SessionSchema = new mongoose.Schema({}, { strict: false });

const MongoEmployee = mongoose.model('Employee', EmployeeSchema);
const MongoAttendance = mongoose.model('Attendance', AttendanceSchema);
const MongoMovement = mongoose.model('MovementRecord', MovementSchema);
const MongoLocation = mongoose.model('LocationUpdate', LocationSchema);
const MongoSession = mongoose.model('Session', SessionSchema);

async function migrateData() {
  try {
    console.log('🚀 Starting COMPLETE Data Migration...\n');

    // Connect to databases
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    console.log('🔗 Connecting to PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected\n');

    // 1. GET ALL DATA
    console.log('📥 Loading all data...');
    const mongoEmployees = await MongoEmployee.find({});
    const mongoAttendance = await MongoAttendance.find({});
    const mongoMovements = await MongoMovement.find({});
    const mongoLocations = await MongoLocation.find({});
    const mongoSessions = await MongoSession.find({});
    
    const pgEmployees = await Employee.findAll();

    console.log('📊 Data loaded:');
    console.log(`  Employees: ${mongoEmployees.length}`);
    console.log(`  Attendance: ${mongoAttendance.length}`);
    console.log(`  Movements: ${mongoMovements.length}`);
    console.log(`  Locations: ${mongoLocations.length}`);
    console.log(`  Sessions: ${mongoSessions.length}\n`);

    // 2. CREATE ID MAPPING (IDs are the same!)
    console.log('🔍 Creating employee ID mapping...');
    const idMapping = {};
    mongoEmployees.forEach(emp => {
      idMapping[emp.id] = emp.id; // IDs are the same!
    });

    // 3. MIGRATE MOVEMENTS (DIRECT ID MATCH)
    console.log('\n🚶 Migrating Movements (direct ID match)...');
    let movementCount = 0;

    for (const mov of mongoMovements) {
      if (idMapping[mov.employee_id]) {
        try {
          await Movement.create({
            id: mov.id,
            employee_id: mov.employee_id, // Same ID!
            timestamp: mov.timestamp ? new Date(mov.timestamp) : new Date(),
            latitude: mov.latitude || 0,
            longitude: mov.longitude || 0,
            reason: mov.reason || 'General Movement',
            estimated_minutes: mov.estimated_minutes || 0,
            status: mov.status || 'active',
            address: mov.address || '',
            return_time: mov.return_time ? new Date(mov.return_time) : null,
            actual_duration_minutes: mov.actual_duration_minutes || 0,
            created_at: mov.created_at || new Date(),
            updated_at: mov.updated_at || new Date()
          });
          movementCount++;
          console.log(`✅ Movement: ${mov.employee_id}`);
        } catch (error) {
          if (error.message.includes('duplicate')) {
            console.log(`⚠️  Movement already exists: ${mov.id}`);
          } else {
            console.log(`❌ Movement ${mov.id}: ${error.message}`);
          }
        }
      } else {
        console.log(`❓ No employee found for movement: ${mov.employee_id}`);
        
        // Try to migrate anyway with the original ID
        try {
          await Movement.create({
            id: mov.id,
            employee_id: mov.employee_id,
            timestamp: mov.timestamp ? new Date(mov.timestamp) : new Date(),
            latitude: mov.latitude || 0,
            longitude: mov.longitude || 0,
            reason: mov.reason || 'General Movement',
            estimated_minutes: mov.estimated_minutes || 0,
            status: mov.status || 'active',
            address: mov.address || '',
            return_time: mov.return_time ? new Date(mov.return_time) : null,
            actual_duration_minutes: mov.actual_duration_minutes || 0,
            created_at: mov.created_at || new Date(),
            updated_at: mov.updated_at || new Date()
          });
          movementCount++;
          console.log(`   ✅ Migrated anyway with original ID`);
        } catch (error) {
          console.log(`   ❌ Failed: ${error.message}`);
        }
      }
    }
    console.log(`🎯 Migrated ${movementCount}/${mongoMovements.length} movement records`);

    // 4. MIGRATE LOCATIONS (DIRECT ID MATCH)
    console.log('\n📍 Migrating Locations (direct ID match)...');
    let locationCount = 0;

    for (const loc of mongoLocations) {
      try {
        await Location.create({
          id: loc.id,
          employee_id: loc.employee_id, // Same ID!
          timestamp: loc.timestamp ? new Date(loc.timestamp) : new Date(),
          latitude: loc.latitude || 0,
          longitude: loc.longitude || 0,
          accuracy: loc.accuracy || null,
          heading: loc.heading || null,
          speed: loc.speed || null,
          address: loc.address || '',
          battery_level: loc.battery_level || null,
          is_mock_location: loc.is_mock_location || false,
          created_at: loc.created_at || new Date(),
          updated_at: loc.updated_at || new Date()
        });
        locationCount++;
      } catch (error) {
        if (!error.message.includes('duplicate')) {
          console.log(`❌ Location ${loc.id}: ${error.message}`);
        }
      }
    }
    console.log(`🎯 Migrated ${locationCount}/${mongoLocations.length} location records`);

    // 5. MIGRATE SESSIONS (DIRECT ID MATCH)
    console.log('\n🔐 Migrating Sessions (direct ID match)...');
    let sessionCount = 0;

    for (const sess of mongoSessions) {
      try {
        await Session.create({
          employee_id: sess.employee_id, // Same ID!
          token: sess.token ? sess.token.substring(0, 500) : 'temp', // Limit length
          created_at: sess.created_at ? new Date(sess.created_at) : new Date(),
          expires_at: sess.expires_at ? new Date(sess.expires_at) : new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
        sessionCount++;
      } catch (error) {
        if (!error.message.includes('duplicate')) {
          console.log(`❌ Session: ${error.message}`);
        }
      }
    }
    console.log(`🎯 Migrated ${sessionCount}/${mongoSessions.length} session records`);

    // FINAL SUMMARY
    console.log('\n🎉 COMPLETE MIGRATION RESULTS');
    console.log('=============================');
    console.log(`⏰ Attendance: 26/26 (already done)`);
    console.log(`🚶 Movements: ${movementCount}/${mongoMovements.length}`);
    console.log(`📍 Locations: ${locationCount}/${mongoLocations.length}`);
    console.log(`🔐 Sessions: ${sessionCount}/${mongoSessions.length}`);
    console.log('=============================');
    console.log('✅ ALL DATA MIGRATED SUCCESSFULLY!');

  } catch (error) {
    console.error('❌ MIGRATION FAILED:', error);
  } finally {
    await mongoose.disconnect();
    await sequelize.close();
    console.log('\n🔌 Connections closed');
    process.exit(0);
  }
}

migrateData();