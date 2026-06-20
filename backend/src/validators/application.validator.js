const allowedStatuses = [
  "Envoyée",
  "En relance",
  "Entretien",
  "Refusée",
  "Acceptée"
];

const allowedContractTypes = [
  "CDI",
  "CDD",
  "Stage",
  "Alternance",
  "Freelance",
  "Autre"
];

function sanitizeRequiredString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

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

function sanitizeOptionalInteger(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isInteger(numberValue)) {
    return null;
  }

  if (numberValue < 0) {
    return null;
  }

  return numberValue;
}

function sanitizeRequiredDate(value) {
  if (typeof value !== "string") {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function sanitizeOptionalDate(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
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

function validateApplicationPayload(request, response, next) {
  const company = sanitizeRequiredString(request.body.company);
  const position = sanitizeRequiredString(request.body.position);
  const status = sanitizeRequiredString(request.body.status);
  const contractType = sanitizeOptionalString(request.body.contractType);
  const location = sanitizeOptionalString(request.body.location);
  const salary = sanitizeOptionalInteger(request.body.salary);
  const link = sanitizeOptionalString(request.body.link);
  const notes = sanitizeOptionalString(request.body.notes);
  const sentAt = sanitizeRequiredDate(request.body.sentAt);
  const followUpAt = sanitizeOptionalDate(request.body.followUpAt);
  const interviewAt = sanitizeOptionalDate(request.body.interviewAt);

  const errors = [];

  if (company.length === 0) {
    errors.push("Company is required.");
  }

  if (position.length === 0) {
    errors.push("Position is required.");
  }

  if (status.length === 0) {
    errors.push("Status is required.");
  }

  if (status.length > 0 && !allowedStatuses.includes(status)) {
    errors.push("Status is invalid.");
  }

  if (contractType && !allowedContractTypes.includes(contractType)) {
    errors.push("Contract type is invalid.");
  }

  if (request.body.salary !== undefined && request.body.salary !== null && request.body.salary !== "") {
    if (salary === null) {
      errors.push("Salary must be a positive integer.");
    }
  }

  if (link && !isValidUrl(link)) {
    errors.push("Link must be a valid URL.");
  }

  if (!sentAt) {
    errors.push("Sent date is required and must be valid.");
  }

  if (errors.length > 0) {
    return response.status(400).json({
      success: false,
      message: "Invalid application data.",
      errors
    });
  }

  request.body.applicationData = {
    company,
    position,
    status,
    contractType,
    location,
    salary,
    link,
    notes,
    sentAt,
    followUpAt,
    interviewAt
  };

  next();
}

function validateApplicationUpdatePayload(request, response, next) {
  const applicationData = {};
  const errors = [];

  if (request.body.company !== undefined) {
    const company = sanitizeRequiredString(request.body.company);

    if (company.length === 0) {
      errors.push("Company cannot be empty.");
    } else {
      applicationData.company = company;
    }
  }

  if (request.body.position !== undefined) {
    const position = sanitizeRequiredString(request.body.position);

    if (position.length === 0) {
      errors.push("Position cannot be empty.");
    } else {
      applicationData.position = position;
    }
  }

  if (request.body.status !== undefined) {
    const status = sanitizeRequiredString(request.body.status);

    if (!allowedStatuses.includes(status)) {
      errors.push("Status is invalid.");
    } else {
      applicationData.status = status;
    }
  }

  if (request.body.contractType !== undefined) {
    const contractType = sanitizeOptionalString(request.body.contractType);

    if (contractType && !allowedContractTypes.includes(contractType)) {
      errors.push("Contract type is invalid.");
    } else {
      applicationData.contractType = contractType;
    }
  }

  if (request.body.location !== undefined) {
    applicationData.location = sanitizeOptionalString(request.body.location);
  }

  if (request.body.salary !== undefined) {
    const salary = sanitizeOptionalInteger(request.body.salary);

    if (request.body.salary !== null && request.body.salary !== "" && salary === null) {
      errors.push("Salary must be a positive integer.");
    } else {
      applicationData.salary = salary;
    }
  }

  if (request.body.link !== undefined) {
    const link = sanitizeOptionalString(request.body.link);

    if (link && !isValidUrl(link)) {
      errors.push("Link must be a valid URL.");
    } else {
      applicationData.link = link;
    }
  }

  if (request.body.notes !== undefined) {
    applicationData.notes = sanitizeOptionalString(request.body.notes);
  }

  if (request.body.sentAt !== undefined) {
    const sentAt = sanitizeRequiredDate(request.body.sentAt);

    if (!sentAt) {
      errors.push("Sent date must be valid.");
    } else {
      applicationData.sentAt = sentAt;
    }
  }

  if (request.body.followUpAt !== undefined) {
    applicationData.followUpAt = sanitizeOptionalDate(request.body.followUpAt);
  }

  if (request.body.interviewAt !== undefined) {
    applicationData.interviewAt = sanitizeOptionalDate(request.body.interviewAt);
  }

  if (Object.keys(applicationData).length === 0) {
    errors.push("At least one valid application field must be provided.");
  }

  if (errors.length > 0) {
    return response.status(400).json({
      success: false,
      message: "Invalid application data.",
      errors
    });
  }

  request.body.applicationData = applicationData;

  next();
}

function validateApplicationContactPayload(request, response, next) {
  const errors = [];

  const contactId = sanitizeOptionalString(request.body.contactId);
  const role = sanitizeOptionalString(request.body.role);

  if (!contactId) {
    errors.push("Contact id is required.");
  }

  if (errors.length > 0) {
    return response.status(400).json({
      success: false,
      message: "Invalid application contact data.",
      errors
    });
  }

  request.body.contactData = {
    contactId,
    role
  };

  next();
}

function validateApplicationTagPayload(request, response, next) {
  const errors = [];

  const tagId = sanitizeOptionalString(request.body.tagId);

  if (!tagId) {
    errors.push("Tag id is required.");
  }

  if (errors.length > 0) {
    return response.status(400).json({
      success: false,
      message: "Invalid application tag data.",
      errors
    });
  }

  request.body.tagData = {
    tagId
  };

  next();
}

function validateApplicationDocumentPayload(request, response, next) {
  const errors = [];

  const documentId = sanitizeOptionalString(request.body.documentId);

  if (!documentId) {
    errors.push("Document id is required.");
  }

  if (errors.length > 0) {
    return response.status(400).json({
      success: false,
      message: "Invalid application document data.",
      errors
    });
  }

  request.body.documentData = {
    documentId
  };

  next();
}

export {
  validateApplicationContactPayload,
  validateApplicationDocumentPayload,
  validateApplicationPayload,
  validateApplicationTagPayload,
  validateApplicationUpdatePayload
};
