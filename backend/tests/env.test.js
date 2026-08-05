import {
  describe,
  expect,
  it
} from "vitest";

import {
  validateEnvironment
} from "../src/config/env.js";

function createValidEnvironment() {
  return {
    NODE_ENV: "development",
    PORT: "4000",
    DATABASE_URL:
      "postgresql://user:password@localhost:5432/jobtrace",
    JWT_SECRET:
      "development-secret-with-more-than-32-characters",
    FRONTEND_URL: "http://localhost:3000",
    AUTH_COOKIE_MAX_AGE: "86400000",
    SMTP_PORT: "587",
    SMTP_SECURE: "false"
  };
}

describe("environment configuration", function () {
  it("accepts a valid development configuration", function () {
    const environment = createValidEnvironment();

    expect(function () {
      validateEnvironment(environment);
    }).not.toThrow();
  });

  it("rejects missing critical variables", function () {
    const environment = createValidEnvironment();

    delete environment.DATABASE_URL;
    delete environment.JWT_SECRET;
    delete environment.FRONTEND_URL;

    expect(function () {
      validateEnvironment(environment);
    }).toThrow(
      "DATABASE_URL is required."
    );
  });

  it("rejects invalid URLs and numeric values", function () {
    const environment = createValidEnvironment();

    environment.DATABASE_URL = "invalid-database-url";
    environment.FRONTEND_URL = "ftp://example.com";
    environment.PORT = "70000";
    environment.SMTP_SECURE = "yes";

    expect(function () {
      validateEnvironment(environment);
    }).toThrow(
      "Invalid environment configuration"
    );
  });

  it("rejects an incomplete production configuration", function () {
    const environment = createValidEnvironment();

    environment.NODE_ENV = "production";
    environment.JWT_SECRET = "too-short";

    expect(function () {
      validateEnvironment(environment);
    }).toThrow(
      "SMTP_HOST is required."
    );
  });

  it("accepts a complete production configuration", function () {
    const environment = createValidEnvironment();

    environment.NODE_ENV = "production";
    environment.FRONTEND_URL = "https://jobtrace.fr";
    environment.SMTP_HOST = "smtp.example.com";
    environment.SMTP_USER = "jobtrace@example.com";
    environment.SMTP_PASSWORD = "secure-password";
    environment.SMTP_FROM =
      "JobTrace <no-reply@jobtrace.fr>";

    expect(function () {
      validateEnvironment(environment);
    }).not.toThrow();
  });
});
