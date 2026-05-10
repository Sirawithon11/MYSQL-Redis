const { verifyToken } = require('../utils/tokenUtils');

/**
 * Middleware to authenticate JWT token
 * Extracts token from Authorization header and verifies it
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
      error: 'No token provided'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: 'Token verification failed'
    });
  }

  req.user = decoded;
  next();
}

module.exports = {
  authenticateToken
};
