function errorMiddleware(error, request, response, next) {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error.";

  response.status(statusCode).json({
    success: false,
    message,
    errors: []
  });
}

export default errorMiddleware;
