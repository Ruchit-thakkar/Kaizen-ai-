/**
 * Global Express Error Handler Middleware.
 * Standardizes API responses for syntax, validation, and database errors.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred on the server.';
  
  // Log the complete error stack in development for faster troubleshooting
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Express Error Handler]`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
