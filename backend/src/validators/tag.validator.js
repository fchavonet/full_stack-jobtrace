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

function createSlug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isValidColor(value) {
  if (!value) {
    return true;
  }

  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function validateTagPayload(request, response, next) {
  const name = sanitizeRequiredString(request.body.name);
  const color = sanitizeOptionalString(request.body.color);
  const slug = createSlug(name);
  const errors = [];

  if (name.length === 0) {
    errors.push("Tag name is required.");
  }

  if (name.length > 50) {
    errors.push("Tag name must contain at most 50 characters.");
  }

  if (slug.length === 0) {
    errors.push("Tag slug is invalid.");
  }

  if (!isValidColor(color)) {
    errors.push("Tag color must be a valid hexadecimal color.");
  }

  if (errors.length > 0) {
    return response.status(400).json({
      success: false,
      message: "Invalid tag data.",
      errors
    });
  }

  request.body.tagData = {
    name,
    slug,
    color
  };

  next();
}

function validateTagUpdatePayload(request, response, next) {
  const tagData = {};
  const errors = [];

  if (request.body.name !== undefined) {
    const name = sanitizeRequiredString(request.body.name);
    const slug = createSlug(name);

    if (name.length === 0) {
      errors.push("Tag name cannot be empty.");
    } else if (name.length > 50) {
      errors.push("Tag name must contain at most 50 characters.");
    } else if (slug.length === 0) {
      errors.push("Tag slug is invalid.");
    } else {
      tagData.name = name;
      tagData.slug = slug;
    }
  }

  if (request.body.color !== undefined) {
    const color = sanitizeOptionalString(request.body.color);

    if (!isValidColor(color)) {
      errors.push("Tag color must be a valid hexadecimal color.");
    } else {
      tagData.color = color;
    }
  }

  if (Object.keys(tagData).length === 0) {
    errors.push("At least one valid tag field must be provided.");
  }

  if (errors.length > 0) {
    return response.status(400).json({
      success: false,
      message: "Invalid tag data.",
      errors
    });
  }

  request.body.tagData = tagData;

  next();
}

export {
  validateTagPayload,
  validateTagUpdatePayload
};
