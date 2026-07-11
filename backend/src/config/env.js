import dotenv from "dotenv";

dotenv.config();

function parseBoolean(value) {
  if (value === "true") {
    return true;
  }

  return false;
}

function parseNumber(value, fallback) {
  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    return fallback;
  }

  return parsedValue;
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || "4000",
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  authCookieName: process.env.AUTH_COOKIE_NAME || "jobtrace_auth",
  authCookieMaxAge: parseNumber(process.env.AUTH_COOKIE_MAX_AGE, 86400000),
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: parseNumber(process.env.SMTP_PORT, 587),
  smtpUser: process.env.SMTP_USER || "",
  smtpPassword: process.env.SMTP_PASSWORD || "",
  smtpFrom: process.env.SMTP_FROM || "JobTrace <no-reply@jobtrace.local>",
  smtpSecure: parseBoolean(process.env.SMTP_SECURE),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000"
};

export default env;
