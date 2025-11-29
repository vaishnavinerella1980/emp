const ExcelJS = require('exceljs');
const AttendanceRepository = require('../repositories/attendanceRepository');
const MovementRepository = require('../repositories/movementRepository');
const EmployeeRepository = require('../repositories/employeeRepository');

class ExportService {
  constructor() {
    this.attendanceRepository = new AttendanceRepository();
    this.movementRepository = new MovementRepository();
    this.employeeRepository = new EmployeeRepository();
  }

  // 🆕 Export Attendance Data to Excel
  async exportAttendanceToExcel(filters = {}) {
    try {
      console.log('📊 Generating Excel export for attendance data');
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Attendance Report');

      // Create header row
      worksheet.columns = [
        { header: 'Employee ID', key: 'employee_id', width: 15 },
        { header: 'Employee Name', key: 'employee_name', width: 20 },
        { header: 'Date', key: 'date', width: 12 },
        { header: 'Clock In', key: 'clock_in_time', width: 20 },
        { header: 'Clock Out', key: 'clock_out_time', width: 20 },
        { header: 'Total Hours', key: 'total_hours', width: 12 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Department', key: 'department', width: 15 }
      ];

      // Style the header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6FA' }
      };

      // Get attendance data
      const { data: attendanceRecords } = await this.attendanceRepository.findWithPagination(filters, {
        limit: 10000 // Export max 10,000 records
      });

      // Add data rows
      attendanceRecords.forEach(record => {
        worksheet.addRow({
          employee_id: record.employee_id,
          employee_name: record.employee_name,
          date: record.date,
          clock_in_time: record.clock_in_time,
          clock_out_time: record.clock_out_time,
          total_hours: record.total_hours,
          status: record.status,
          department: record.department
        });
      });

      // Add summary row
      const summaryRow = worksheet.addRow({});
      worksheet.addRow({
        employee_name: 'TOTAL RECORDS',
        total_hours: attendanceRecords.length
      });
      worksheet.getRow(worksheet.rowCount).font = { bold: true };

      return workbook;
    } catch (error) {
      console.error('❌ Error generating Excel export:', error);
      throw error;
    }
  }

  // 🆕 Export Movement Data to Excel
  async exportMovementsToExcel(employeeId, startDate, endDate) {
    try {
      console.log('📊 Generating Excel export for movement data');
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Movement Report');

      // Create header row
      worksheet.columns = [
        { header: 'Movement ID', key: 'id', width: 20 },
        { header: 'Employee ID', key: 'employee_id', width: 15 },
        { header: 'Timestamp', key: 'timestamp', width: 20 },
        { header: 'Reason', key: 'reason', width: 25 },
        { header: 'Address', key: 'address', width: 30 },
        { header: 'Estimated Minutes', key: 'estimated_minutes', width: 18 },
        { header: 'Actual Minutes', key: 'actual_duration_minutes', width: 16 },
        { header: 'Status', key: 'status', width: 12 }
      ];

      // Style the header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6F3FF' }
      };

      // Get movement data
      const { records: movementRecords } = await this.movementRepository.findByEmployeeId(employeeId, {
        startDate,
        endDate,
        limit: 10000
      });

      // Add data rows
      movementRecords.forEach(record => {
        worksheet.addRow({
          id: record.id,
          employee_id: record.employee_id,
          timestamp: record.timestamp,
          reason: record.reason,
          address: record.address,
          estimated_minutes: record.estimated_minutes,
          actual_duration_minutes: record.actual_duration_minutes,
          status: record.status
        });
      });

      return workbook;
    } catch (error) {
      console.error('❌ Error generating movement Excel export:', error);
      throw error;
    }
  }
}

module.exports = ExportService;