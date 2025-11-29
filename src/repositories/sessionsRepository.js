const Session = require('../models/sequelize/Session');
const { ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

class SessionRepository {
  async create(sessionData) {
    try {
      console.log('Creating session in PostgreSQL...');
      const session = await Session.create(sessionData);
      console.log('Session saved successfully');
      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw new ApiError(500, `Failed to create session: ${error.message}`);
    }
  }

  async findByToken(token) {
    try {
      console.log('Finding session by token');
      const session = await Session.findOne({ 
        where: { token } 
      });
      console.log('Session found by token:', !!session);
      return session;
    } catch (error) {
      console.error('Error finding session by token:', error);
      throw new ApiError(500, `Failed to find session: ${error.message}`);
    }
  }

  async findByEmployeeId(employeeId) {
    try {
      console.log('Finding sessions for employee:', employeeId);
      const sessions = await Session.findAll({
        where: { employee_id: employeeId },
        order: [['created_at', 'DESC']]
      });
      console.log('Sessions found:', sessions.length);
      return sessions;
    } catch (error) {
      console.error('Error finding sessions by employee ID:', error);
      throw new ApiError(500, `Failed to find sessions: ${error.message}`);
    }
  }

  async deleteByToken(token) {
    try {
      console.log('Deleting session by token');
      const affectedCount = await Session.destroy({
        where: { token }
      });
      console.log('Session deletion result:', affectedCount > 0);
      return affectedCount > 0;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw new ApiError(500, `Failed to delete session: ${error.message}`);
    }
  }

  async deleteExpiredSessions() {
    try {
      console.log('Deleting expired sessions...');
      const now = new Date();
      const affectedCount = await Session.destroy({
        where: {
          expires_at: { [Op.lt]: now }
        }
      });
      console.log('Expired sessions deleted:', affectedCount);
      return affectedCount;
    } catch (error) {
      console.error('Error deleting expired sessions:', error);
      throw new ApiError(500, `Failed to delete expired sessions: ${error.message}`);
    }
  }

  async deleteAllByEmployeeId(employeeId) {
    try {
      console.log('Deleting all sessions for employee:', employeeId);
      const affectedCount = await Session.destroy({
        where: { employee_id: employeeId }
      });
      console.log('Sessions deleted for employee:', affectedCount);
      return affectedCount;
    } catch (error) {
      console.error('Error deleting employee sessions:', error);
      throw new ApiError(500, `Failed to delete employee sessions: ${error.message}`);
    }
  }
}

module.exports = SessionRepository;