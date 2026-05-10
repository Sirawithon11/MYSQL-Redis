/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Default error response
  const errorResponse = {
    success: false,
    message: 'An error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  };

  // Handle specific error types
  if (err.status) {
    errorResponse.message = err.message;
    return res.status(err.status).json(errorResponse);
  }

  // Database errors
  if (err.code && err.code.startsWith('ER_')) {
    if (err.code === 'ER_DUP_ENTRY') {
      errorResponse.message = 'Duplicate entry in database';
      return res.status(409).json(errorResponse);
    }
    return res.status(500).json(errorResponse);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    errorResponse.message = 'Invalid token';
    return res.status(401).json(errorResponse);
  }

  if (err.name === 'TokenExpiredError') {
    errorResponse.message = 'Token expired';
    return res.status(401).json(errorResponse);
  }

  // Default 500 error
  res.status(err.status || 500).json(errorResponse);
}

module.exports = errorHandler;
