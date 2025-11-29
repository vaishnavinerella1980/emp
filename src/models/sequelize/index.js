const Employee = require('./Employee');
const Attendance = require('./attendance');
const Movement = require('./Movement');
const Location = require('./Location');
const Session = require('./Session');
const TimingReport = require('./TimingReport'); // NEW
const OfficeLocation = require('./OfficeLocation'); // NEW

// Define associations
Employee.hasMany(Attendance, { foreignKey: 'employee_id' });
Attendance.belongsTo(Employee, { foreignKey: 'employee_id' });

Employee.hasMany(Movement, { foreignKey: 'employee_id' });
Movement.belongsTo(Employee, { foreignKey: 'employee_id' });

Employee.hasMany(Location, { foreignKey: 'employee_id' });
Location.belongsTo(Employee, { foreignKey: 'employee_id' });

Employee.hasMany(TimingReport, { foreignKey: 'employee_id' });
TimingReport.belongsTo(Employee, { foreignKey: 'employee_id' });

module.exports = {
  Employee,
  Attendance,
  Movement,
  Location,
  Session,
  TimingReport,
  OfficeLocation
};