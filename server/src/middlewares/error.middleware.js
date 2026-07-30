const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    //spreads (copies) all properties into the object.  NODE_ENV is a special environment variable that is set to 'development' when the app is running in development mode. This means that the stack trace will only be included in the response if the app is running in development mode, which can be useful for debugging.
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
