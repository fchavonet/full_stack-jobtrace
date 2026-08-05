import request from "supertest";
import {
  afterAll,
  beforeEach,
  describe,
  expect,
  test,
  vi
} from "vitest";

import app from "../src/app.js";

import {
  sendEmailVerificationEmail,
  sendPasswordResetEmail
} from "../src/services/email.service.js";

import {
  cleanDatabase,
  disconnectDatabase
} from "./helpers/test-db.js";

import {
  TEST_AUTH_EMAIL,
  TEST_AUTH_PASSWORD,
  createAuthenticatedTestUser
} from "./helpers/test-auth.js";

vi.mock("../src/services/email.service.js", function () {
  return {
    sendEmailVerificationEmail: vi.fn(),
    sendPasswordResetEmail: vi.fn()
  };
});

const NEW_PASSWORD = "NewPassword42";

function getLastMockToken(mockedFunction) {
  const lastCallIndex =
    mockedFunction.mock.calls.length - 1;

  const lastCall =
    mockedFunction.mock.calls[lastCallIndex];

  return lastCall[0].token;
}

async function registerAndVerifyUser() {
  await request(app)
    .post("/api/auth/register")
    .send({
      email: TEST_AUTH_EMAIL,
      password: TEST_AUTH_PASSWORD
    });

  const verificationToken =
    getLastMockToken(sendEmailVerificationEmail);

  await request(app)
    .get("/api/auth/verify-email")
    .query({
      token: verificationToken
    });
}

beforeEach(async function () {
  vi.clearAllMocks();
  await cleanDatabase();
});

afterAll(async function () {
  await cleanDatabase();
  await disconnectDatabase();
});

describe("Authentication session invalidation", function () {
  test("Should invalidate existing session after password reset", async function () {
    await registerAndVerifyUser();

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: TEST_AUTH_EMAIL,
        password: TEST_AUTH_PASSWORD
      });

    expect(loginResponse.status).toBe(200);

    const authenticationCookie =
      loginResponse.headers["set-cookie"][0];

    await request(app)
      .post("/api/auth/forgot-password")
      .send({
        email: TEST_AUTH_EMAIL
      });

    const resetToken =
      getLastMockToken(sendPasswordResetEmail);

    const resetResponse = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token: resetToken,
        password: NEW_PASSWORD
      });

    expect(resetResponse.status).toBe(200);

    const authenticatedResponse = await request(app)
      .get("/api/auth/me")
      .set("Cookie", authenticationCookie);

    expect(authenticatedResponse.status).toBe(401);

    expect(authenticatedResponse.body).toEqual({
      success: false,
      message:
        "Authentication session is no longer valid.",
      errors: []
    });

    const newLoginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: TEST_AUTH_EMAIL,
        password: NEW_PASSWORD
      });

    expect(newLoginResponse.status).toBe(200);
  });

  test("Should invalidate existing session after authenticated password change", async function () {
    const { user, token } =
      await createAuthenticatedTestUser();

    const passwordResponse = await request(app)
      .patch("/api/profile/password")
      .set("Authorization", "Bearer " + token)
      .send({
        currentPassword: TEST_AUTH_PASSWORD,
        newPassword: NEW_PASSWORD
      });

    expect(passwordResponse.status).toBe(200);

    const profileResponse = await request(app)
      .get("/api/profile")
      .set("Authorization", "Bearer " + token);

    expect(profileResponse.status).toBe(401);

    expect(profileResponse.body).toEqual({
      success: false,
      message:
        "Authentication session is no longer valid.",
      errors: []
    });

    const newLoginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: user.email,
        password: NEW_PASSWORD
      });

    expect(newLoginResponse.status).toBe(200);
  });
});
