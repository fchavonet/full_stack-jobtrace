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

function validateSettingsPayload(request, response, next) {
  const { theme, dailyGoal, followUpDelayDays } = request.body;

  const data = {};

  if (theme !== undefined) {
    if (theme !== "light" && theme !== "dark") {
      return response.status(400).json({
        success: false,
        message: "Theme must be light or dark.",
        errors: []
      });
    }

    data.theme = theme;
  }

  if (dailyGoal !== undefined) {
    if (!Number.isInteger(dailyGoal)) {
      return response.status(400).json({
        success: false,
        message: "Daily goal must be an integer.",
        errors: []
      });
    }

    if (dailyGoal < 1 || dailyGoal > 50) {
      return response.status(400).json({
        success: false,
        message: "Daily goal must be between 1 and 50.",
        errors: []
      });
    }

    data.dailyGoal = dailyGoal;
  }

  if (followUpDelayDays !== undefined) {
    if (!Number.isInteger(followUpDelayDays)) {
      return response.status(400).json({
        success: false,
        message: "Follow-up delay must be an integer.",
        errors: []
      });
    }

    if (followUpDelayDays < 1 || followUpDelayDays > 90) {
      return response.status(400).json({
        success: false,
        message: "Follow-up delay must be between 1 and 90 days.",
        errors: []
      });
    }

    data.followUpDelayDays = followUpDelayDays;
  }

  if (Object.keys(data).length === 0) {
    return response.status(400).json({
      success: false,
      message: "At least one setting must be provided.",
      errors: []
    });
  }

  request.body.settingsData = data;

  next();
}

export {
  validateProfilePayload,
  validateSettingsPayload
};
