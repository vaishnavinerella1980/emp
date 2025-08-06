const validator = require('validator');

class Validators {
  static isValidEmail(email) {
    return validator.isEmail(email);
  }

  static isValidPassword(password) {
    return password && password.length >= 6;
  }

  static isValidCoordinate(lat, lng) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    return (
      !isNaN(latitude) && 
      !isNaN(longitude) && 
      latitude >= -90 && 
      latitude <= 90 && 
      longitude >= -180 && 
      longitude <= 180
    );
  }

  static sanitizeString(str, maxLength = 255) {
    if (!str) return '';
    return str.toString().trim().substring(0, maxLength);
  }
}

module.exports = Validators;