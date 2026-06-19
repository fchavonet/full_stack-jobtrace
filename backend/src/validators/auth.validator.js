function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
}

function isValidPassword(password) {
  const hasLength = password.length >= 6;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);

  return hasLength && hasLowercase && hasUppercase && hasDigit;
}

function validateRegisterPayload(request, response, next) {
  const { email, password } = request.body;

  if (!email || typeof email !== "string") {
    return response.status(400).json({
      success: false,
      message: "Email is required.",
      errors: []
    });
  }

  if (!isValidEmail(email.trim())) {
    return response.status(400).json({
      success: false,
      message: "Email is invalid.",
      errors: []
    });
  }

  if (!password || typeof password !== "string") {
    return response.status(400).json({
      success: false,
      message: "Password is required.",
      errors: []
    });
  }

  if (!isValidPassword(password)) {
    return response.status(400).json({
      success: false,
      message: "Password must contain at least 6 characters, one lowercase letter, one uppercase letter and one digit.",
      errors: []
    });
  }

  next();
}

function validateEmailVerificationPayload(request, response, next) {
  const { token } = request.query;

  if (!token || typeof token !== "string") {
    return response.status(400).json({
      success: false,
      message: "Email verification token is required.",
      errors: []
    });
  }

  next();
}

function validateLoginPayload(request, response, next) {
  const { email, password } = request.body;

  if (!email || typeof email !== "string") {
    return response.status(400).json({
      success: false,
      message: "Email is required.",
      errors: []
    });
  }

  if (!isValidEmail(email.trim())) {
    return response.status(400).json({
      success: false,
      message: "Email is invalid.",
      errors: []
    });
  }

  if (!password || typeof password !== "string") {
    return response.status(400).json({
      success: false,
      message: "Password is required.",
      errors: []
    });
  }

  next();
}

function validateForgotPasswordPayload(request, response, next) {
  const { email } = request.body;

  if (!email || typeof email !== "string") {
    return response.status(400).json({
      success: false,
      message: "Email is required.",
      errors: []
    });
  }

  if (!isValidEmail(email.trim())) {
    return response.status(400).json({
      success: false,
      message: "Email is invalid.",
      errors: []
    });
  }

  next();
}

function validateResetPasswordPayload(request, response, next) {
  const { token, password } = request.body;

  if (!token || typeof token !== "string") {
    return response.status(400).json({
      success: false,
      message: "Password reset token is required.",
      errors: []
    });
  }

  if (!password || typeof password !== "string") {
    return response.status(400).json({
      success: false,
      message: "Password is required.",
      errors: []
    });
  }

  if (!isValidPassword(password)) {
    return response.status(400).json({
      success: false,
      message: "Password must contain at least 6 characters, one lowercase letter, one uppercase letter and one digit.",
      errors: []
    });
  }

  next();
}

export {
  validateEmailVerificationPayload,
  validateForgotPasswordPayload,
  validateLoginPayload,
  validateRegisterPayload,
  validateResetPasswordPayload
};
