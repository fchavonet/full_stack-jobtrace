import request from "supertest";
import { afterAll, beforeEach, describe, expect, test } from "vitest";

import app from "../src/app.js";
import env from "../src/config/env.js";

import {
  cleanDatabase,
  disconnectDatabase
} from "./helpers/test-db.js";

import {
  TEST_AUTH_PASSWORD,
  createAuthenticatedTestUser
} from "./helpers/test-auth.js";

const NEW_PASSWORD = "NewPassword42";
const WRONG_PASSWORD = "WrongPassword42";

const AUTH_REQUIRED_RESPONSE = {
  success: false,
  message: "Authentication token is required.",
  errors: []
};

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

function expectDefaultProfileFields(profile, email) {
  expect(profile).toMatchObject({
    email,
    firstName: null,
    lastName: null,
    avatarUrl: null,
    emailVerified: true,
    theme: "light",
    dailyGoal: 5,
    followUpDelayDays: 15
  });

  expect(profile.id).toEqual(expect.any(String));
  expect(profile.createdAt).toEqual(expect.any(String));
  expect(profile.updatedAt).toEqual(expect.any(String));
}

beforeEach(async function () {
  await cleanDatabase();
});

afterAll(async function () {
  await disconnectDatabase();
});

describe("Profile routes", function () {
  test("GET /api/profile - Should return authenticated user profile", async function () {
    const { user, token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Profile retrieved successfully.");

    expectDefaultProfileFields(response.body.data.profile, user.email);
  });

  test("PATCH /api/profile: should update authenticated user profile", async function () {
    const { user, token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .patch("/api/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "Dick",
        lastName: "Grayson"
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Profile updated successfully.");

    expect(response.body.data.profile).toMatchObject({
      email: user.email,
      firstName: "Dick",
      lastName: "Grayson",
      avatarUrl: null,
      emailVerified: true,
      theme: "light",
      dailyGoal: 5,
      followUpDelayDays: 15
    });

    expect(response.body.data.profile.id).toEqual(expect.any(String));
    expect(response.body.data.profile.createdAt).toEqual(expect.any(String));
    expect(response.body.data.profile.updatedAt).toEqual(expect.any(String));
  });

  test("PATCH /api/profile - Should allow clearing optional profile fields", async function () {
    const { user, token } = await createAuthenticatedTestUser();

    await request(app)
      .patch("/api/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "Dick",
        lastName: "Grayson",
        avatarUrl: "https://example.com/avatar.png"
      });

    const response = await request(app)
      .patch("/api/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "",
        lastName: "",
        avatarUrl: ""
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Profile updated successfully.");

    expectDefaultProfileFields(response.body.data.profile, user.email);
  });

  test("PATCH /api/profile - Should reject invalid first name", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .patch("/api/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "J@son",
        lastName: "Todd"
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "First name can only contain letters, spaces and hyphens.",
      errors: []
    });
  });

  test("PATCH /api/profile/settings - Should update authenticated user settings", async function () {
    const { user, token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .patch("/api/profile/settings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        theme: "dark",
        dailyGoal: 10,
        followUpDelayDays: 30
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Settings updated successfully.");

    expect(response.body.data.profile).toMatchObject({
      email: user.email,
      firstName: null,
      lastName: null,
      avatarUrl: null,
      emailVerified: true,
      theme: "dark",
      dailyGoal: 10,
      followUpDelayDays: 30
    });

    expect(response.body.data.profile.id).toEqual(expect.any(String));
    expect(response.body.data.profile.createdAt).toEqual(expect.any(String));
    expect(response.body.data.profile.updatedAt).toEqual(expect.any(String));
  });

  test("PATCH /api/profile/settings - Should reject invalid theme", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .patch("/api/profile/settings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        theme: "red"
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "Theme must be light or dark.",
      errors: []
    });
  });

  test("PATCH /api/profile/settings - Should reject empty settings payload", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .patch("/api/profile/settings")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "At least one setting must be provided.",
      errors: []
    });
  });

  test("PATCH /api/profile/password - Should update authenticated user password", async function () {
    const { user, token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .patch("/api/profile/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: TEST_AUTH_PASSWORD,
        newPassword: NEW_PASSWORD
      });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "Password updated successfully.",
      data: {}
    });

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: user.email,
        password: NEW_PASSWORD
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.message).toBe("User logged in successfully.");
    expect(loginResponse.body.data.token).toBeUndefined();

    expectAuthenticationCookie(loginResponse);
  });

  test("PATCH /api/profile/password - Should reject invalid current password", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .patch("/api/profile/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: WRONG_PASSWORD,
        newPassword: NEW_PASSWORD
      });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Current password is incorrect.",
      errors: []
    });
  });

  test("PATCH /api/profile/password - Should reject weak new password", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .patch("/api/profile/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: TEST_AUTH_PASSWORD,
        newPassword: "weak"
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "New password must contain at least 6 characters, one lowercase letter, one uppercase letter and one digit.",
      errors: []
    });
  });

  test("GET /api/profile - Should reject request without authentication token", async function () {
    const response = await request(app).get("/api/profile");

    expectAuthenticationRequired(response);
  });

  test("PATCH /api/profile - Should reject request without authentication token", async function () {
    const response = await request(app)
      .patch("/api/profile")
      .send({
        firstName: "Dick",
        lastName: "Grayson"
      });

    expectAuthenticationRequired(response);
  });

  test("PATCH /api/profile/settings - Should reject request without authentication token", async function () {
    const response = await request(app)
      .patch("/api/profile/settings")
      .send({
        theme: "dark"
      });

    expectAuthenticationRequired(response);
  });

  test("PATCH /api/profile/password - Should reject request without authentication token", async function () {
    const response = await request(app)
      .patch("/api/profile/password")
      .send({
        currentPassword: TEST_AUTH_PASSWORD,
        newPassword: NEW_PASSWORD
      });

    expectAuthenticationRequired(response);
  });
});
