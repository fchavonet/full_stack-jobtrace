import dotenv from "dotenv";

dotenv.config();

const ALLOWED_NODE_ENV_VALUES = new Set([
  "development",
  "test",
  "production"
]);

function parseBoolean(value) {
  return value === "true";
}

function parseNumber(value, fallback) {
  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    return fallback;
  }

  return parsedValue;
}

function isMissing(value) {
  return typeof value !== "string" || value.trim() === "";
}

function validateRequiredVariable(environment, variableName, errors) {
  if (isMissing(environment[variableName])) {
    errors.push(variableName + " is required.");
  }
}

function validateIntegerVariable(
  environment,
  variableName,
  minimum,
  maximum,
  errors
) {
  const rawValue = environment[variableName];

  if (isMissing(rawValue)) {
    return;
  }

  const parsedValue = Number(rawValue);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < minimum ||
    parsedValue > maximum
  ) {
    errors.push(
      variableName +
      " must be an integer between " +
      minimum +
      " and " +
      maximum +
      "."
    );
  }
}

function validateUrlVariable(
  environment,
  variableName,
  allowedProtocols,
  errors
) {
  const rawValue = environment[variableName];

  if (isMissing(rawValue)) {
    return;
  }

  try {
    const parsedUrl = new URL(rawValue);

    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      errors.push(
        variableName +
        " must use one of these protocols: " +
        allowedProtocols.join(", ") +
        "."
      );
    }
  } catch {
    errors.push(variableName + " must be a valid URL.");
  }
}

function validateBooleanVariable(environment, variableName, errors) {
  const rawValue = environment[variableName];

  if (isMissing(rawValue)) {
    return;
  }

  if (rawValue !== "true" && rawValue !== "false") {
    errors.push(variableName + ' must be either "true" or "false".');
  }
}

export function validateEnvironment(environment = process.env) {
  const errors = [];
  const nodeEnv = environment.NODE_ENV || "development";

  if (!ALLOWED_NODE_ENV_VALUES.has(nodeEnv)) {
    errors.push(
      "NODE_ENV must be development, test or production."
    );
  }

  validateRequiredVariable(environment, "DATABASE_URL", errors);
  validateRequiredVariable(environment, "JWT_SECRET", errors);
  validateRequiredVariable(environment, "FRONTEND_URL", errors);

  validateUrlVariable(
    environment,
    "DATABASE_URL",
    ["postgres:", "postgresql:"],
    errors
  );

  validateUrlVariable(
    environment,
    "FRONTEND_URL",
    ["http:", "https:"],
    errors
  );

  validateIntegerVariable(environment, "PORT", 1, 65535, errors);
  validateIntegerVariable(
    environment,
    "AUTH_COOKIE_MAX_AGE",
    1,
    Number.MAX_SAFE_INTEGER,
    errors
  );
  validateIntegerVariable(environment, "SMTP_PORT", 1, 65535, errors);
  validateBooleanVariable(environment, "SMTP_SECURE", errors);

  if (nodeEnv === "production") {
    validateRequiredVariable(environment, "SMTP_HOST", errors);
    validateRequiredVariable(environment, "SMTP_USER", errors);
    validateRequiredVariable(environment, "SMTP_PASSWORD", errors);
    validateRequiredVariable(environment, "SMTP_FROM", errors);

    if (
      !isMissing(environment.JWT_SECRET) &&
      environment.JWT_SECRET.length < 32
    ) {
      errors.push(
        "JWT_SECRET must contain at least 32 characters in production."
      );
    }

    if (
      environment.JWT_SECRET === "change_this_secret_in_development"
    ) {
      errors.push(
        "JWT_SECRET must not use the development placeholder in production."
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(
      "Invalid environment configuration:\n- " +
      errors.join("\n- ")
    );
  }
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || "4000",
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  jwtIssuer:
    process.env.JWT_ISSUER || "jobtrace-api",
  jwtAudience:
    process.env.JWT_AUDIENCE || "jobtrace-web",
  authCookieName:
    process.env.AUTH_COOKIE_NAME || "jobtrace_auth",
  authCookieMaxAge: parseNumber(
    process.env.AUTH_COOKIE_MAX_AGE,
    86400000
  ),
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: parseNumber(process.env.SMTP_PORT, 587),
  smtpUser: process.env.SMTP_USER || "",
  smtpPassword: process.env.SMTP_PASSWORD || "",
  smtpFrom:
    process.env.SMTP_FROM ||
    "JobTrace <no-reply@jobtrace.local>",
  smtpSecure: parseBoolean(process.env.SMTP_SECURE),
  frontendUrl:
    process.env.FRONTEND_URL || "http://localhost:3000"
};

export default env;
