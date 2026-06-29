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

function isValidEmail(value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(value);
}

function isValidUrl(value) {
  try {
    const url = new URL(value);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

function buildContactData(request) {
  return {
    firstName: sanitizeOptionalString(request.body.firstName),
    lastName: sanitizeOptionalString(request.body.lastName),
    position: sanitizeOptionalString(request.body.position),
    email: sanitizeOptionalString(request.body.email),
    phoneNumber: sanitizeOptionalString(request.body.phoneNumber),
    company: sanitizeOptionalString(request.body.company),
    linkedinUrl: sanitizeOptionalString(request.body.linkedinUrl),
    notes: sanitizeOptionalString(request.body.notes)
  };
}

function hasAtLeastOneContactField(contactData) {
  if (contactData.firstName) {
    return true;
  }

  if (contactData.lastName) {
    return true;
  }

  if (contactData.position) {
    return true;
  }

  if (contactData.email) {
    return true;
  }

  if (contactData.phoneNumber) {
    return true;
  }

  if (contactData.company) {
    return true;
  }

  if (contactData.linkedinUrl) {
    return true;
  }

  if (contactData.notes) {
    return true;
  }

  return false;
}

function validateContactPayload(request, response, next) {
  const contactData = buildContactData(request);

  if (!hasAtLeastOneContactField(contactData)) {
    return response.status(400).json({
      success: false,
      message: "At least one contact field must be provided.",
      errors: []
    });
  }

  if (contactData.email && !isValidEmail(contactData.email)) {
    return response.status(400).json({
      success: false,
      message: "Email must be valid.",
      errors: []
    });
  }

  if (contactData.linkedinUrl && !isValidUrl(contactData.linkedinUrl)) {
    return response.status(400).json({
      success: false,
      message: "LinkedIn URL must be a valid URL.",
      errors: []
    });
  }

  request.body.contactData = contactData;

  next();
}

function validateContactUpdatePayload(request, response, next) {
  const contactData = {};

  if (request.body.firstName !== undefined) {
    contactData.firstName = sanitizeOptionalString(request.body.firstName);
  }

  if (request.body.lastName !== undefined) {
    contactData.lastName = sanitizeOptionalString(request.body.lastName);
  }

  if (request.body.position !== undefined) {
    contactData.position = sanitizeOptionalString(request.body.position);
  }

  if (request.body.email !== undefined) {
    contactData.email = sanitizeOptionalString(request.body.email);
  }

  if (request.body.phoneNumber !== undefined) {
    contactData.phoneNumber = sanitizeOptionalString(request.body.phoneNumber);
  }

  if (request.body.company !== undefined) {
    contactData.company = sanitizeOptionalString(request.body.company);
  }

  if (request.body.linkedinUrl !== undefined) {
    contactData.linkedinUrl = sanitizeOptionalString(request.body.linkedinUrl);
  }

  if (request.body.notes !== undefined) {
    contactData.notes = sanitizeOptionalString(request.body.notes);
  }

  if (Object.keys(contactData).length === 0) {
    return response.status(400).json({
      success: false,
      message: "At least one valid contact field must be provided.",
      errors: []
    });
  }

  if (contactData.email && !isValidEmail(contactData.email)) {
    return response.status(400).json({
      success: false,
      message: "Email must be valid.",
      errors: []
    });
  }

  if (contactData.linkedinUrl && !isValidUrl(contactData.linkedinUrl)) {
    return response.status(400).json({
      success: false,
      message: "LinkedIn URL must be a valid URL.",
      errors: []
    });
  }

  request.body.contactData = contactData;

  next();
}

export {
  validateContactPayload,
  validateContactUpdatePayload
};
