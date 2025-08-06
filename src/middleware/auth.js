const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/environment');
const { ApiError } = require('./errorHandler');
const { MESSAGES } = require('../constants/messages');

class AuthMiddleware {
  static authenticate = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];

      if (!token) {
        throw new ApiError(401, MESSAGES.AUTH.TOKEN_REQUIRED);
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return next(new ApiError(401, MESSAGES.AUTH.INVALID_TOKEN));
      }
      if (error.name === 'TokenExpiredError') {
        return next(new ApiError(401, MESSAGES.AUTH.TOKEN_EXPIRED));
      }
      next(error);
    }
  };

  static authorize = (roles = []) => {
    return (req, res, next) => {
      if (!req.user) {
        return next(new ApiError(401, MESSAGES.AUTH.UNAUTHORIZED));
      }

      if (roles.length && !roles.includes(req.user.role)) {
        return next(new ApiError(403, MESSAGES.AUTH.FORBIDDEN));
      }

      next();
    };
  };

  static checkOwnership = (req, res, next) => {
    const { employeeId } = req.params;
    const requestingEmployeeId = req.user.employeeId;

    if (employeeId !== requestingEmployeeId) {
      return next(new ApiError(403, MESSAGES.AUTH.ACCESS_DENIED));
    }

    next();
  };
}

module.exports = AuthMiddleware;
