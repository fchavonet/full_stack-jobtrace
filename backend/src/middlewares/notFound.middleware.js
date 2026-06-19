function notFoundMiddleware(request, response) {
  response.status(404).json({
    success: false,
    message: "Route not found.",
    errors: []
  });
}

export default notFoundMiddleware;
