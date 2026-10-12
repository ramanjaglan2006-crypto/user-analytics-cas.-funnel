/**
 * Centralized error handler middleware
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      error: {
        message: messages.join(', '),
        details: err.errors
      }
    });
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        message: `Resource not found or invalid identifier format: ${err.value}`
      }
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error'
    }
  });
}

/**
 * 404 Not Found handler for undefined routes
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      message: `Endpoint not found: ${req.method} ${req.originalUrl}`
    }
  });
}
