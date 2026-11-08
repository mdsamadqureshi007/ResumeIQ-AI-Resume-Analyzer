const multer = require('multer');

/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`,
  });
};

/**
 * Centralized Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  // Determine HTTP status code
  let statusCode = err.statusCode || res.statusCode;
  if (!statusCode || statusCode < 400) {
    statusCode = 500;
  }

  // Handle Multer upload errors
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      err.message = 'Uploaded file is too large. The maximum permitted file size is 5MB.';
    } else {
      err.message = `File upload error: ${err.message}`;
    }
  }

  // Handle Mongoose cast error (e.g. invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    err.message = 'The specified analysis identifier is invalid.';
  }

  // Log error safely without leaking sensitive tokens or resume data
  console.error(`[Error] [${req.method} ${req.url}] ${statusCode} - ${err.message}`);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    // Never expose stack trace in production
    ...(process.env.NODE_ENV === 'development' && { errorType: err.name }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
