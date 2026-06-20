const allowedDocumentTypes = [
  "resume",
  "cover_letter",
  "portfolio",
  "other"
];

function sanitizeRequiredString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function isAllowedDocumentType(type) {
  return allowedDocumentTypes.includes(type);
}

function validateDocumentPayload(request, response, next) {
  const type = sanitizeRequiredString(request.body.type);
  const errors = [];

  if (!request.file) {
    errors.push("Document file is required.");
  }

  if (type.length === 0) {
    errors.push("Document type is required.");
  }

  if (type.length > 0 && !isAllowedDocumentType(type)) {
    errors.push("Document type is invalid.");
  }

  if (errors.length > 0) {
    return response.status(400).json({
      success: false,
      message: "Invalid document data.",
      errors
    });
  }

  request.body.documentData = {
    type
  };

  next();
}

function validateDocumentUpdatePayload(request, response, next) {
  const type = sanitizeRequiredString(request.body.type);
  const errors = [];

  if (type.length === 0) {
    errors.push("Document type is required.");
  }

  if (type.length > 0 && !isAllowedDocumentType(type)) {
    errors.push("Document type is invalid.");
  }

  if (errors.length > 0) {
    return response.status(400).json({
      success: false,
      message: "Invalid document data.",
      errors
    });
  }

  request.body.documentData = {
    type
  };

  next();
}

export {
  allowedDocumentTypes,
  validateDocumentPayload,
  validateDocumentUpdatePayload
};
