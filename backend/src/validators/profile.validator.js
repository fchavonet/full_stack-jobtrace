function sanitizeOptionalString(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return null;
  }

  return trimmedValue;
}

function isValidName(value) {
  const nameRegex = /^[a-zA-ZÀ-ÿ\s-]+$/;

  return nameRegex.test(value);
}

function validateProfilePayload(request, response, next) {
  const firstName = sanitizeOptionalString(request.body.firstName);
  const lastName = sanitizeOptionalString(request.body.lastName);
  const avatarUrl = sanitizeOptionalString(request.body.avatarUrl);

  if (firstName && firstName.length > 30) {
    return response.status(400).json({
      success: false,
      message: "First name must contain at most 30 characters.",
      errors: []
    });
  }

  if (firstName && !isValidName(firstName)) {
    return response.status(400).json({
      success: false,
      message: "First name can only contain letters, spaces and hyphens.",
      errors: []
    });
  }

  if (lastName && lastName.length > 40) {
    return response.status(400).json({
      success: false,
      message: "Last name must contain at most 40 characters.",
      errors: []
    });
  }

  if (lastName && !isValidName(lastName)) {
    return response.status(400).json({
      success: false,
      message: "Last name can only contain letters, spaces and hyphens.",
      errors: []
    });
  }

  request.body.firstName = firstName;
  request.body.lastName = lastName;
  request.body.avatarUrl = avatarUrl;

  next();
}

export { validateProfilePayload };
