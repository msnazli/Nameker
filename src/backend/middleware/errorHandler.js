const winston = require('winston');

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log the error
  winston.error(err.message, { 
    error: err,
    requestPath: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    timestamp: new Date().toISOString()
  });

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      details: 'Invalid or missing authentication token'
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      error: 'Forbidden',
      details: 'You do not have permission to perform this action'
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      error: 'Not Found',
      details: err.message
    });
  }

  // Handle payment-related errors
  if (err.name === 'PaymentError') {
    return res.status(402).json({
      error: 'Payment Required',
      details: err.message
    });
  }

  // Handle rate limiting errors
  if (err.name === 'RateLimitError') {
    return res.status(429).json({
      error: 'Too Many Requests',
      details: 'Please try again later'
    });
  }

  // Default error response for unhandled errors
  return res.status(500).json({
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  });
};

module.exports = {
  errorHandler
}; 