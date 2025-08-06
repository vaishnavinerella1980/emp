const Session = require('../models/Session');

class SessionRepository {
  async create(sessionData) {
    const session = new Session(sessionData);
    return await session.save();
  }

  async findByToken(token) {
    return await Session.findOne({ token });
  }

  async deleteByToken(token) {
    return await Session.deleteOne({ token });
  }

  async deleteByEmployeeId(employeeId) {
    return await Session.deleteMany({ employee_id: employeeId });
  }

  async cleanup() {
    // Remove expired sessions
    return await Session.deleteMany({
      expires_at: { $lt: new Date() }
    });
  }
}

module.exports = SessionRepository;