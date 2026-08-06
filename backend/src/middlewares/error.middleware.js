import multer from "multer";

import env from "../config/env.js";

const INTERNAL_SERVER_ERROR_MESSAGE =
  "Internal server error.";

const INVALID_UPLOAD_MESSAGE =
  "Invalid document upload.";

const FILE_TOO_LARGE_MESSAGE =
  "Document file is too large. Maximum size is 5 MB.";

function getMulterStatusCode(error) {
  if (error.code === "LIMIT_FILE_SIZE") {
    return 413;
  }

  return 400;
}

function getStatusCode(error) {
  if (error instanceof multer.MulterError) {
    return getMulterStatusCode(error);
  }

  const statusCode =
    error.statusCode ||
    error.status ||
    500;

  if (
    !Number.isInteger(statusCode) ||
    statusCode < 400 ||
    statusCode > 599
  ) {
    return 500;
  }

  return statusCode;
}

function getMulterMessage(error) {
  if (error.code === "LIMIT_FILE_SIZE") {
    return FILE_TOO_LARGE_MESSAGE;
  }

  return INVALID_UPLOAD_MESSAGE;
}

function getPublicMessage(error, statusCode) {
  if (
    env.nodeEnv === "production" &&
    statusCode >= 500
  ) {
    return INTERNAL_SERVER_ERROR_MESSAGE;
  }

  if (error instanceof multer.MulterError) {
    return getMulterMessage(error);
  }

  if (error.message) {
    return error.message;
  }

  return INTERNAL_SERVER_ERROR_MESSAGE;
}

function logInternalError(error, statusCode) {
  if (
    env.nodeEnv === "production" &&
    statusCode >= 500
  ) {
    console.error(error);
  }
}

function errorMiddleware(
  error,
  request,
  response,
  _next
) {
  const statusCode = getStatusCode(error);

  const message = getPublicMessage(
    error,
    statusCode
  );

  logInternalError(error, statusCode);

  response.status(statusCode).json({
    success: false,
    message,
    errors: []
  });
}

export default errorMiddleware;
