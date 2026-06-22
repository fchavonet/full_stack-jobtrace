import request from "supertest";
import { afterAll, beforeEach, describe, expect, test } from "vitest";

import app from "../src/app.js";

import {
  cleanDatabase,
  disconnectDatabase
} from "./helpers/test-db.js";

import {
  createAuthenticatedTestUser
} from "./helpers/test-auth.js";

const TAG_PAYLOAD = {
  name: "Bat Signal",
  color: "#ffee00"
};

const UPDATED_TAG_PAYLOAD = {
  name: "Gotham Priority",
  color: "#000000"
};

const UNKNOWN_ID = "00000000-0000-0000-0000-000000000000";

const AUTH_REQUIRED_RESPONSE = {
  success: false,
  message: "Authentication token is required.",
  errors: []
};

function expectAuthenticationRequired(response) {
  expect(response.status).toBe(401);
  expect(response.body).toEqual(AUTH_REQUIRED_RESPONSE);
}

function expectTagFields(tag, expected = {}) {
  expect(tag).toMatchObject({
    name: TAG_PAYLOAD.name,
    slug: "bat-signal",
    color: TAG_PAYLOAD.color,
    ...expected
  });

  expect(tag.id).toEqual(expect.any(String));
  expect(tag.createdAt).toEqual(expect.any(String));
  expect(tag.updatedAt).toEqual(expect.any(String));
}

async function createTestTag(token, payload = TAG_PAYLOAD) {
  const response = await request(app)
    .post("/api/tags")
    .set("Authorization", `Bearer ${token}`)
    .send(payload);

  return response;
}

beforeEach(async function () {
  await cleanDatabase();
});

afterAll(async function () {
  await disconnectDatabase();
});

describe("Tag routes", function () {
  test("POST /api/tags - Should create authenticated user tag", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await createTestTag(token);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Tag created successfully.");

    expectTagFields(response.body.data.tag);
  });

  test("GET /api/tags - Should return authenticated user tags", async function () {
    const { token } = await createAuthenticatedTestUser();

    await createTestTag(token);

    const response = await request(app)
      .get("/api/tags")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Tags retrieved successfully.");

    expect(response.body.data.tags).toHaveLength(1);
    expectTagFields(response.body.data.tags[0]);
  });

  test("GET /api/tags/:id - Should return authenticated user tag", async function () {
    const { token } = await createAuthenticatedTestUser();

    const createResponse = await createTestTag(token);
    const tagId = createResponse.body.data.tag.id;

    const response = await request(app)
      .get(`/api/tags/${tagId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Tag retrieved successfully.");

    expectTagFields(response.body.data.tag);
  });

  test("PATCH /api/tags/:id - Should update authenticated user tag", async function () {
    const { token } = await createAuthenticatedTestUser();

    const createResponse = await createTestTag(token);
    const tagId = createResponse.body.data.tag.id;

    const response = await request(app)
      .patch(`/api/tags/${tagId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(UPDATED_TAG_PAYLOAD);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Tag updated successfully.");

    expectTagFields(response.body.data.tag, {
      name: UPDATED_TAG_PAYLOAD.name,
      slug: "gotham-priority",
      color: UPDATED_TAG_PAYLOAD.color
    });
  });

  test("DELETE /api/tags/:id - Should delete authenticated user tag", async function () {
    const { token } = await createAuthenticatedTestUser();

    const createResponse = await createTestTag(token);
    const tagId = createResponse.body.data.tag.id;

    const deleteResponse = await request(app)
      .delete(`/api/tags/${tagId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);
    expect(deleteResponse.body.message).toBe("Tag deleted successfully.");

    expectTagFields(deleteResponse.body.data.tag);

    const getResponse = await request(app)
      .get(`/api/tags/${tagId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getResponse.status).toBe(404);

    expect(getResponse.body).toEqual({
      success: false,
      message: "Tag not found.",
      errors: []
    });
  });

  test("POST /api/tags - Should reject duplicate tag name", async function () {
    const { token } = await createAuthenticatedTestUser();

    await createTestTag(token);

    const response = await createTestTag(token);

    expect(response.status).toBe(409);

    expect(response.body).toEqual({
      success: false,
      message: "Tag already exists.",
      errors: []
    });
  });

  test("POST /api/tags - Should reject invalid tag color", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await createTestTag(token, {
      name: "Invalid Color",
      color: "red"
    });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid tag data.",
      errors: [
        "Tag color must be a valid hexadecimal color."
      ]
    });
  });

  test("POST /api/tags - Should reject missing tag name", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await createTestTag(token, {
      name: "",
      color: "#ffee00"
    });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid tag data.",
      errors: [
        "Tag name is required.",
        "Tag slug is invalid."
      ]
    });
  });

  test("PATCH /api/tags/:id - Should reject invalid tag color", async function () {
    const { token } = await createAuthenticatedTestUser();

    const createResponse = await createTestTag(token);
    const tagId = createResponse.body.data.tag.id;

    const response = await request(app)
      .patch(`/api/tags/${tagId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        color: "red"
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid tag data.",
      errors: [
        "Tag color must be a valid hexadecimal color.",
        "At least one valid tag field must be provided."
      ]
    });
  });

  test("PATCH /api/tags/:id - Should reject empty update payload", async function () {
    const { token } = await createAuthenticatedTestUser();

    const createResponse = await createTestTag(token);
    const tagId = createResponse.body.data.tag.id;

    const response = await request(app)
      .patch(`/api/tags/${tagId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid tag data.",
      errors: [
        "At least one valid tag field must be provided."
      ]
    });
  });

  test("GET /api/tags/:id - Should return not found for unknown tag", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .get(`/api/tags/${UNKNOWN_ID}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Tag not found.",
      errors: []
    });
  });

  test("PATCH /api/tags/:id - Should return not found for unknown tag", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .patch(`/api/tags/${UNKNOWN_ID}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Unknown Tag"
      });

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Tag not found.",
      errors: []
    });
  });

  test("DELETE /api/tags/:id - Should return not found for unknown tag", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .delete(`/api/tags/${UNKNOWN_ID}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Tag not found.",
      errors: []
    });
  });

  test("GET /api/tags - Should reject request without authentication token", async function () {
    const response = await request(app).get("/api/tags");

    expectAuthenticationRequired(response);
  });

  test("POST /api/tags - Should reject request without authentication token", async function () {
    const response = await request(app)
      .post("/api/tags")
      .send(TAG_PAYLOAD);

    expectAuthenticationRequired(response);
  });

  test("GET /api/tags/:id - Should reject request without authentication token", async function () {
    const response = await request(app).get(`/api/tags/${UNKNOWN_ID}`);

    expectAuthenticationRequired(response);
  });

  test("PATCH /api/tags/:id - Should reject request without authentication token", async function () {
    const response = await request(app)
      .patch(`/api/tags/${UNKNOWN_ID}`)
      .send(UPDATED_TAG_PAYLOAD);

    expectAuthenticationRequired(response);
  });

  test("DELETE /api/tags/:id - Should reject request without authentication token", async function () {
    const response = await request(app).delete(`/api/tags/${UNKNOWN_ID}`);

    expectAuthenticationRequired(response);
  });
});
