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

const AUTH_REQUIRED_RESPONSE = {
  success: false,
  message: "Authentication token is required.",
  errors: []
};

const APPLICATION_PAYLOAD = {
  company: "Wayne Enterprises",
  position: "Robin",
  status: "sent",
  contractType: "permanent",
  location: "Gotham City",
  salary: 50000,
  link: "https://careers.wayne-enterprises.example/jobs/robin",
  notes: "Application used for automated validation.",
  sentAt: "2026-06-21",
  followUpAt: "2026-07-06",
  interviewAt: null
};

function expectAuthenticationRequired(response) {
  expect(response.status).toBe(401);
  expect(response.body).toEqual(AUTH_REQUIRED_RESPONSE);
}

function expectApplicationFields(application, overrides = {}) {
  const expectedApplication = {
    company: APPLICATION_PAYLOAD.company,
    position: APPLICATION_PAYLOAD.position,
    status: APPLICATION_PAYLOAD.status,
    contractType: APPLICATION_PAYLOAD.contractType,
    location: APPLICATION_PAYLOAD.location,
    salary: APPLICATION_PAYLOAD.salary,
    link: APPLICATION_PAYLOAD.link,
    notes: APPLICATION_PAYLOAD.notes,
    sentAt: "2026-06-21T00:00:00.000Z",
    followUpAt: "2026-07-06T00:00:00.000Z",
    interviewAt: null,
    tags: [],
    contacts: [],
    documents: [],
    ...overrides
  };

  expect(application).toMatchObject(expectedApplication);

  expect(application.id).toEqual(expect.any(String));
  expect(application.createdAt).toEqual(expect.any(String));
  expect(application.updatedAt).toEqual(expect.any(String));
}

async function createTestApplication(token, payload = APPLICATION_PAYLOAD) {
  const response = await request(app)
    .post("/api/applications")
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

describe("Application routes", function () {
  test("POST /api/applications - Should create authenticated user application", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await createTestApplication(token);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Application created successfully.");

    expectApplicationFields(response.body.data.application);
  });

  test("GET /api/applications - Should return authenticated user applications", async function () {
    const { token } = await createAuthenticatedTestUser();

    await createTestApplication(token);

    const response = await request(app)
      .get("/api/applications")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Applications retrieved successfully.");

    expect(response.body.data.applications).toHaveLength(1);
    expectApplicationFields(response.body.data.applications[0]);
  });

  test("GET /api/applications/:id - Should return authenticated user application", async function () {
    const { token } = await createAuthenticatedTestUser();

    const createResponse = await createTestApplication(token);
    const applicationId = createResponse.body.data.application.id;

    const response = await request(app)
      .get(`/api/applications/${applicationId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Application retrieved successfully.");

    expectApplicationFields(response.body.data.application);
  });

  test("PATCH /api/applications/:id - Should update authenticated user application", async function () {
    const { token } = await createAuthenticatedTestUser();

    const createResponse = await createTestApplication(token);
    const applicationId = createResponse.body.data.application.id;

    const response = await request(app)
      .patch(`/api/applications/${applicationId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "interview",
        interviewAt: "2026-07-12"
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Application updated successfully.");

    expectApplicationFields(response.body.data.application, {
      status: "interview",
      interviewAt: "2026-07-12T00:00:00.000Z"
    });
  });

  test("DELETE /api/applications/:id - Should delete authenticated user application", async function () {
    const { token } = await createAuthenticatedTestUser();

    const createResponse = await createTestApplication(token);
    const applicationId = createResponse.body.data.application.id;

    const deleteResponse = await request(app)
      .delete(`/api/applications/${applicationId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);
    expect(deleteResponse.body.message).toBe("Application deleted successfully.");

    expectApplicationFields(deleteResponse.body.data.application);

    const getResponse = await request(app)
      .get(`/api/applications/${applicationId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getResponse.status).toBe(404);
    expect(getResponse.body).toEqual({
      success: false,
      message: "Application not found.",
      errors: []
    });
  });

  test("POST /api/applications - Should reject invalid application status", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await createTestApplication(token, {
      ...APPLICATION_PAYLOAD,
      status: "invalid"
    });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid application data.",
      errors: [
        "Status is invalid."
      ]
    });
  });

  test("POST /api/applications - Should reject invalid application payload", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${token}`)
      .send({
        company: "",
        position: "",
        status: "",
        sentAt: "invalid-date"
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid application data.",
      errors: [
        "Company is required.",
        "Position is required.",
        "Status is required.",
        "Sent date is required and must be valid."
      ]
    });
  });

  test("PATCH /api/applications/:id - Should reject empty update payload", async function () {
    const { token } = await createAuthenticatedTestUser();

    const createResponse = await createTestApplication(token);
    const applicationId = createResponse.body.data.application.id;

    const response = await request(app)
      .patch(`/api/applications/${applicationId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid application data.",
      errors: [
        "At least one valid application field must be provided."
      ]
    });
  });

  test("GET /api/applications/:id - Should return not found for unknown application", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .get("/api/applications/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Application not found.",
      errors: []
    });
  });

  test("GET /api/applications/:id/history - Should return authenticated user application history", async function () {
    const { token } = await createAuthenticatedTestUser();

    const createResponse = await createTestApplication(token);
    const applicationId = createResponse.body.data.application.id;

    await request(app)
      .patch(`/api/applications/${applicationId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "interview"
      });

    const response = await request(app)
      .get(`/api/applications/${applicationId}/history`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Application history retrieved successfully.");

    expect(response.body.data.history).toHaveLength(2);

    expect(response.body.data.history[0]).toMatchObject({
      action: "application_status_updated",
      metadata: {
        previousStatus: "sent",
        newStatus: "interview"
      }
    });

    expect(response.body.data.history[1]).toMatchObject({
      action: "application_created",
      metadata: {
        company: APPLICATION_PAYLOAD.company,
        position: APPLICATION_PAYLOAD.position,
        status: APPLICATION_PAYLOAD.status
      }
    });

    expect(response.body.data.history[0].id).toEqual(expect.any(String));
    expect(response.body.data.history[0].createdAt).toEqual(expect.any(String));
  });

  test("GET /api/applications - Should reject request without authentication token", async function () {
    const response = await request(app).get("/api/applications");

    expectAuthenticationRequired(response);
  });

  test("GET /api/applications/:id/history - Should reject request without authentication token", async function () {
    const response = await request(app)
      .get("/api/applications/00000000-0000-0000-0000-000000000000/history");

    expectAuthenticationRequired(response);
  });
});
