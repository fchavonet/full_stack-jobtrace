import request from "supertest";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";

import app from "../src/app.js";
import env from "../src/config/env.js";

import {
  sendEmailVerificationEmail,
  sendPasswordResetEmail
} from "../src/services/email.service.js";

import {
  cleanDatabase,
  disconnectDatabase
} from "./helpers/test-db.js";

import {
  TEST_AUTH_EMAIL
} from "./helpers/test-auth.js";

vi.mock("../src/services/email.service.js", function () {
  return {
    sendEmailVerificationEmail: vi.fn(),
    sendPasswordResetEmail: vi.fn()
  };
});

const TEST_EMAIL = TEST_AUTH_EMAIL;
const UNKNOWN_EMAIL = "unknown@jobtrace.test";
const TEST_PASSWORD = "Password42";
const NEW_PASSWORD = "NewPassword42";
const WRONG_PASSWORD = "WrongPassword1";
const INVALID_TOKEN = "invalid-token";

const AUTH_REQUIRED_RESPONSE = {
  success: false,
  message: "Authentication token is required.",
  errors: []
};

const INVALID_CREDENTIALS_RESPONSE = {
  success: false,
  message: "Invalid credentials.",
  errors: []
};

function expectDefaultUserFields(user, emailVerified) {
  expect(user).toMatchObject({
    email: TEST_EMAIL,
    firstName: null,
    lastName: null,
    avatarUrl: null,
    emailVerified,
    theme: "light",
    dailyGoal: 5,
    followUpDelayDays: 15
  });

  expect(user.id).toEqual(expect.any(String));
  expect(user.createdAt).toEqual(expect.any(String));
  expect(user.updatedAt).toEqual(expect.any(String));
}

function expectAuthenticationRequired(response) {
  expect(response.status).toBe(401);
  expect(response.body).toEqual(AUTH_REQUIRED_RESPONSE);
}

function expectAuthenticationCookie(response) {
  const cookies = response.headers["set-cookie"];

  expect(cookies).toEqual(expect.any(Array));
  expect(cookies.length).toBeGreaterThan(0);

  const authCookie = cookies.find(function (cookie) {
    return cookie.startsWith(`${env.authCookieName}=`);
  });

  expect(authCookie).toEqual(expect.any(String));
  expect(authCookie).toContain("HttpOnly");
  expect(authCookie).toContain("SameSite=Lax");
  expect(authCookie).toContain("Path=/");

  return authCookie;
}

function expectClearedAuthenticationCookie(response) {
  const cookies = response.headers["set-cookie"];

  expect(cookies).toEqual(expect.any(Array));
  expect(cookies.length).toBeGreaterThan(0);

  const authCookie = cookies.find(function (cookie) {
    return cookie.startsWith(`${env.authCookieName}=`);
  });

  expect(authCookie).toEqual(expect.any(String));
  expect(authCookie).toContain("HttpOnly");
  expect(authCookie).toContain("SameSite=Lax");
  expect(authCookie).toContain("Path=/");

  return authCookie;
}

function getLastMockPayload(mockedFunction) {
  const lastCallIndex = mockedFunction.mock.calls.length - 1;
  const lastCall = mockedFunction.mock.calls[lastCallIndex];
  const payload = lastCall[0];

  return payload;
}

function getLastEmailVerificationToken() {
  const payload = getLastMockPayload(
    sendEmailVerificationEmail
  );

  return payload.token;
}

function getLastPasswordResetToken() {
  const payload = getLastMockPayload(
    sendPasswordResetEmail
  );

  return payload.token;
}

async function registerTestUser() {
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

  return response;
}

async function verifyTestUserEmail() {
  const verificationToken =
    getLastEmailVerificationToken();

  const response = await request(app)
    .get("/api/auth/verify-email")
    .query({
      token: verificationToken
    });

  return response;
}

async function loginTestUser(
  password = TEST_PASSWORD
) {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: TEST_EMAIL,
      password
    });

  return response;
}

async function getAuthenticatedCookie() {
  await registerTestUser();
  await verifyTestUserEmail();

  const loginResponse = await loginTestUser();
  const authCookie =
    expectAuthenticationCookie(loginResponse);

  return authCookie;
}

beforeEach(async function () {
  vi.clearAllMocks();

  await cleanDatabase();
});

afterAll(async function () {
  await cleanDatabase();
  await disconnectDatabase();
});

describe("Authentication routes", function () {
  test("POST /api/auth/register - Should create a new unverified user", async function () {
    const response = await registerTestUser();

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "User registered successfully. Please check your email to verify your account."
    );

    expectDefaultUserFields(
      response.body.data.user,
      false
    );

    expect(
      sendEmailVerificationEmail
    ).toHaveBeenCalledTimes(1);

    expect(
      sendEmailVerificationEmail
    ).toHaveBeenCalledWith({
      email: TEST_EMAIL,
      token: expect.any(String)
    });
  });

  test("POST /api/auth/register - Should reject duplicate email", async function () {
    await registerTestUser();

    const response = await registerTestUser();

    expect(response.status).toBe(409);

    expect(response.body).toEqual({
      success: false,
      message: "Email is already registered.",
      errors: []
    });
  });

  test("POST /api/auth/login - Should reject unverified user", async function () {
    await registerTestUser();

    const response = await loginTestUser();

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
      success: false,
      message:
        "Email must be verified before login.",
      errors: []
    });
  });

  test("GET /api/auth/verify-email - Should verify user email with valid token", async function () {
    await registerTestUser();

    const response = await verifyTestUserEmail();

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Email verified successfully."
    );

    expectDefaultUserFields(
      response.body.data.user,
      true
    );
  });

  test("GET /api/auth/verify-email - Should reject invalid token", async function () {
    const response = await request(app)
      .get("/api/auth/verify-email")
      .query({
        token: INVALID_TOKEN
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message:
        "Email verification token is invalid.",
      errors: []
    });
  });

  test("POST /api/auth/login - Should login verified user", async function () {
    await registerTestUser();
    await verifyTestUserEmail();

    const response = await loginTestUser();

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "User logged in successfully."
    );

    expect(response.body.data.user).toMatchObject({
      email: TEST_EMAIL,
      emailVerified: true
    });

    expect(
      response.body.data.token
    ).toBeUndefined();

    expectAuthenticationCookie(response);
  });

  test("POST /api/auth/login - Should reject invalid credentials", async function () {
    await registerTestUser();

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: TEST_EMAIL,
        password: WRONG_PASSWORD
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual(
      INVALID_CREDENTIALS_RESPONSE
    );
  });

  test("POST /api/auth/logout - Should clear authentication cookie", async function () {
    const authCookie =
      await getAuthenticatedCookie();

    const response = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", authCookie);

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "User logged out successfully.",
      data: {}
    });

    expectClearedAuthenticationCookie(response);
  });

  test("POST /api/auth/logout - Should succeed without authentication cookie", async function () {
    const response = await request(app)
      .post("/api/auth/logout");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "User logged out successfully.",
      data: {}
    });

    expectClearedAuthenticationCookie(response);
  });

  test("GET /api/auth/me - Should return current authenticated user", async function () {
    const authCookie =
      await getAuthenticatedCookie();

    const response = await request(app)
      .get("/api/auth/me")
      .set("Cookie", authCookie);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Current user retrieved successfully."
    );

    expect(response.body.data.user).toMatchObject({
      email: TEST_EMAIL,
      emailVerified: true
    });

    expect(
      response.body.data.user.id
    ).toEqual(expect.any(String));

    expect(
      response.body.data.user.createdAt
    ).toEqual(expect.any(String));

    expect(
      response.body.data.user.updatedAt
    ).toEqual(expect.any(String));
  });

  test("GET /api/auth/me - Should reject request without authentication token", async function () {
    const response = await request(app)
      .get("/api/auth/me");

    expectAuthenticationRequired(response);
  });

  test("POST /api/auth/forgot-password - Should process password reset request", async function () {
    await registerTestUser();

    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send({
        email: TEST_EMAIL
      });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message:
        "Password reset request processed successfully.",
      data: {}
    });

    expect(
      sendPasswordResetEmail
    ).toHaveBeenCalledTimes(1);

    expect(
      sendPasswordResetEmail
    ).toHaveBeenCalledWith({
      email: TEST_EMAIL,
      token: expect.any(String)
    });
  });

  test("POST /api/auth/forgot-password - Should return neutral response for unknown email", async function () {
    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send({
        email: UNKNOWN_EMAIL
      });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message:
        "Password reset request processed successfully.",
      data: {}
    });

    expect(
      sendPasswordResetEmail
    ).not.toHaveBeenCalled();
  });

  test("POST /api/auth/reset-password - Should reset forgotten password with valid token", async function () {
    await registerTestUser();

    await request(app)
      .post("/api/auth/forgot-password")
      .send({
        email: TEST_EMAIL
      });

    const resetToken =
      getLastPasswordResetToken();

    const resetResponse = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token: resetToken,
        password: NEW_PASSWORD
      });

    expect(resetResponse.status).toBe(200);

    expect(resetResponse.body).toEqual({
      success: true,
      message: "Password reset successfully.",
      data: {}
    });

    await verifyTestUserEmail();

    const loginResponse =
      await loginTestUser(NEW_PASSWORD);

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);

    expect(loginResponse.body.message).toBe(
      "User logged in successfully."
    );

    expect(
      loginResponse.body.data.token
    ).toBeUndefined();

    expectAuthenticationCookie(loginResponse);
  });

  test("POST /api/auth/reset-password - Should reject invalid token", async function () {
    const response = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token: INVALID_TOKEN,
        password: NEW_PASSWORD
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message:
        "Password reset token is invalid.",
      errors: []
    });
  });

  test("GET /api/auth/export - Should export authenticated user data without sensitive fields", async function () {
    const authCookie =
      await getAuthenticatedCookie();

    const response = await request(app)
      .get("/api/auth/export")
      .set("Cookie", authCookie);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe(
      "User data exported successfully."
    );

    expect(response.body.data).toMatchObject({
      user: {
        email: TEST_EMAIL,
        emailVerified: true
      },
      applications: [],
      contacts: [],
      documents: [],
      tags: []
    });

    expect(
      response.body.data.exportedAt
    ).toEqual(expect.any(String));

    const serializedExport = JSON.stringify(
      response.body.data
    );

    expect(serializedExport).not.toContain(
      "passwordHash"
    );

    expect(serializedExport).not.toContain(
      "password_hash"
    );

    expect(serializedExport).not.toContain(
      "emailVerifyToken"
    );

    expect(serializedExport).not.toContain(
      "email_verify_token"
    );

    expect(serializedExport).not.toContain(
      "emailVerifyExpires"
    );

    expect(serializedExport).not.toContain(
      "email_verify_expires"
    );

    expect(serializedExport).not.toContain(
      "resetToken"
    );

    expect(serializedExport).not.toContain(
      "reset_token"
    );

    expect(serializedExport).not.toContain(
      "resetTokenExpires"
    );

    expect(serializedExport).not.toContain(
      "reset_token_expires"
    );
  });

  test("GET /api/auth/export - Should reject request without authentication token", async function () {
    const response = await request(app)
      .get("/api/auth/export");

    expectAuthenticationRequired(response);
  });

  test("DELETE /api/auth/me - Should delete authenticated user account", async function () {
    const authCookie =
      await getAuthenticatedCookie();

    const deleteResponse = await request(app)
      .delete("/api/auth/me")
      .set("Cookie", authCookie);

    expect(deleteResponse.status).toBe(200);

    expect(deleteResponse.body).toEqual({
      success: true,
      message: "Account deleted successfully.",
      data: {}
    });

    expectClearedAuthenticationCookie(
      deleteResponse
    );

    const loginAfterDeletionResponse =
      await loginTestUser();

    expect(
      loginAfterDeletionResponse.status
    ).toBe(401);

    expect(
      loginAfterDeletionResponse.body
    ).toEqual(INVALID_CREDENTIALS_RESPONSE);
  });

  test("DELETE /api/auth/me - Should reject request without authentication token", async function () {
    const response = await request(app)
      .delete("/api/auth/me");

    expectAuthenticationRequired(response);
  });
});
