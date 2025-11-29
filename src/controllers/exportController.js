const ExportService = require('../services/exportService');
const { ApiResponse, asyncHandler } = require('../utils/response');

class ExportController {
  constructor() {
    this.exportService = new ExportService();
  }

  // 🆕 Export Attendance to Excel
  exportAttendance = asyncHandler(async (req, res) => {
    const { startDate, endDate, department, office } = req.query;

    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (department) filters.department = department;
    if (office) filters.office = office;

    const workbook = await this.exportService.exportAttendanceToExcel(filters);

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.xlsx');

    // Send the Excel file
    await workbook.xlsx.write(res);
    res.end();
  });

  // 🆕 Export Movements to Excel
  exportMovements = asyncHandler(async (req, res) => {
    const { employeeId, startDate, endDate } = req.query;
    const requestingEmployeeId = req.user.employeeId;
    const role = req.user.role;

    // Authorization: Employees can only export their own data
    if (role === 'employee' && employeeId !== requestingEmployeeId) {
      return res.status(403).json(
        ApiResponse.error('Access denied. Employees can only export their own data.')
      );
    }

    const workbook = await this.exportService.exportMovementsToExcel(
      employeeId || requestingEmployeeId,
      startDate,
      endDate
    );

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=movement_report.xlsx');

    // Send the Excel file
    await workbook.xlsx.write(res);
    res.end();
  });
}

module.exports = ExportController;