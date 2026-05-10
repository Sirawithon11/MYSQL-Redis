/**
 * Validate username format
 * @param {string} username
 * @returns {object} { valid: boolean, message: string }
 */
function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, message: 'Username must be a string' };
  }

  if (username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters' };
  }

  if (username.length > 30) {
    return { valid: false, message: 'Username must not exceed 30 characters' };
  }

  // Only alphanumeric and underscore
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }

  return { valid: true };
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {object} { valid: boolean, message: string }
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password must be a string' };
  }

  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }

  if (password.length > 100) {
    return { valid: false, message: 'Password must not exceed 100 characters' };
  }

  return { valid: true };
}

/**
 * Validate phone format
 * @param {string} phone
 * @returns {object} { valid: boolean, message: string }
 */
function validatePhone(phone) {
  if (!phone) {
    return { valid: true }; // Phone is optional
  }

  if (typeof phone !== 'string') {
    return { valid: false, message: 'Phone must be a string' };
  }

  if (phone.length < 7 || phone.length > 20) {
    return { valid: false, message: 'Phone must be between 7 and 20 characters' };
  }

  // Allow digits, +, -, space, and parentheses
  if (!/^[\d\+\-\s\(\)]+$/.test(phone)) {
    return { valid: false, message: 'Phone contains invalid characters' };
  }

  return { valid: true };
}

module.exports = {
  validateUsername,
  validatePassword,
  validatePhone
};
