require('dotenv').config();
const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {object} user User object with id and username
 * @returns {string} JWT token
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify JWT token
 * @param {string} token
 * @returns {object|null} Decoded token or null if invalid
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken
};
