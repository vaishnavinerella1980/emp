const Session = require('../models/Session');
const { ApiError } = require('../middleware/errorHandler');

class SessionRepository {
  async create(sessionData) {
    try {
      console.log('Creating session in database...');
      const session = new Session(sessionData);
      const savedSession = await session.save();
      console.log('Session saved successfully');
      return savedSession;
    } catch (error) {
      console.error('Error creating session:', error);
      throw new ApiError(500, `Failed to create session: ${error.message}`);
    }
  }

  async findByToken(token) {
    try {
      console.log('Finding session by token');
      const session = await Session.findOne({ token });
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
      const sessions = await Session.find({ employee_id: employeeId })
        .sort({ created_at: -1 });
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
      const result = await Session.deleteOne({ token });
      console.log('Session deletion result:', result.deletedCount > 0);
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw new ApiError(500, `Failed to delete session: ${error.message}`);
    }
  }

  async deleteExpiredSessions() {
    try {
      console.log('Deleting expired sessions...');
      const now = new Date().toISOString();
      const result = await Session.deleteMany({
        expires_at: { $lt: now }
      });
      console.log('Expired sessions deleted:', result.deletedCount);
      return result.deletedCount;
    } catch (error) {
      console.error('Error deleting expired sessions:', error);
      throw new ApiError(500, `Failed to delete expired sessions: ${error.message}`);
    }
  }

  async deleteAllByEmployeeId(employeeId) {
    try {
      console.log('Deleting all sessions for employee:', employeeId);
      const result = await Session.deleteMany({ employee_id: employeeId });
      console.log('Sessions deleted for employee:', result.deletedCount);
      return result.deletedCount;
    } catch (error) {
      console.error('Error deleting employee sessions:', error);
      throw new ApiError(500, `Failed to delete employee sessions: ${error.message}`);
    }
  }
}

module.exports = SessionRepository;