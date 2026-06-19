function errorMiddleware(error, request, response, _next) {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error.";

  response.status(statusCode).json({
    success: false,
    message,
    errors: []
  });
}

export default errorMiddleware;
