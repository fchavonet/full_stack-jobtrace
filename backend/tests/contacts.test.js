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

const CONTACT_PAYLOAD = {
  firstName: "Bruce",
  lastName: "Wayne",
  email: "bruce.wayne@wayne-enterprises.example",
  phoneNumber: "0600000000",
  company: "Wayne Enterprises",
  notes: "Contact used for automated validation."
};

const UPDATED_CONTACT_PAYLOAD = {
  company: "Wayne Industries"
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

function expectContactFields(contact, expected = {}) {
  expect(contact).toMatchObject({
    firstName: CONTACT_PAYLOAD.firstName,
    lastName: CONTACT_PAYLOAD.lastName,
    email: CONTACT_PAYLOAD.email,
    phoneNumber: CONTACT_PAYLOAD.phoneNumber,
    company: CONTACT_PAYLOAD.company,
    notes: CONTACT_PAYLOAD.notes,
    ...expected
  });

  expect(contact.id).toEqual(expect.any(String));
  expect(contact.createdAt).toEqual(expect.any(String));
  expect(contact.updatedAt).toEqual(expect.any(String));
}

async function createTestContact(token, payload = CONTACT_PAYLOAD) {
  const response = await request(app)
    .post("/api/contacts")
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

describe("Contact routes", function () {
  test("POST /api/contacts - Should create authenticated user contact", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await createTestContact(token);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Contact created successfully.");

    expectContactFields(response.body.data.contact);
  });

  test("GET /api/contacts - Should return authenticated user contacts", async function () {
    const { token } = await createAuthenticatedTestUser();

    await createTestContact(token);

    const response = await request(app)
      .get("/api/contacts")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Contacts retrieved successfully.");

    expect(response.body.data.contacts).toHaveLength(1);
    expectContactFields(response.body.data.contacts[0]);
  });

  test("GET /api/contacts/:id - Should return authenticated user contact", async function () {
    const { token } = await createAuthenticatedTestUser();

    const createResponse = await createTestContact(token);
    const contactId = createResponse.body.data.contact.id;

    const response = await request(app)
      .get(`/api/contacts/${contactId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Contact retrieved successfully.");

    expectContactFields(response.body.data.contact);
  });

  test("PATCH /api/contacts/:id - Should update authenticated user contact", async function () {
    const { token } = await createAuthenticatedTestUser();

    const createResponse = await createTestContact(token);
    const contactId = createResponse.body.data.contact.id;

    const response = await request(app)
      .patch(`/api/contacts/${contactId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(UPDATED_CONTACT_PAYLOAD);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Contact updated successfully.");

    expectContactFields(response.body.data.contact, UPDATED_CONTACT_PAYLOAD);
  });

  test("DELETE /api/contacts/:id - Should delete authenticated user contact", async function () {
    const { token } = await createAuthenticatedTestUser();

    const createResponse = await createTestContact(token);
    const contactId = createResponse.body.data.contact.id;

    const deleteResponse = await request(app)
      .delete(`/api/contacts/${contactId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);
    expect(deleteResponse.body.message).toBe("Contact deleted successfully.");

    expectContactFields(deleteResponse.body.data.contact);

    const getResponse = await request(app)
      .get(`/api/contacts/${contactId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getResponse.status).toBe(404);

    expect(getResponse.body).toEqual({
      success: false,
      message: "Contact not found.",
      errors: []
    });
  });

  test("PATCH /api/contacts/:id - Should reject invalid contact email", async function () {
    const { token } = await createAuthenticatedTestUser();

    const createResponse = await createTestContact(token);
    const contactId = createResponse.body.data.contact.id;

    const response = await request(app)
      .patch(`/api/contacts/${contactId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: "invalid-email"
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "Email must be valid.",
      errors: []
    });
  });

  test("POST /api/contacts - Should reject invalid contact email", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await createTestContact(token, {
      ...CONTACT_PAYLOAD,
      email: "invalid-email"
    });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "Email must be valid.",
      errors: []
    });
  });

  test("PATCH /api/contacts/:id - Should reject empty update payload", async function () {
    const { token } = await createAuthenticatedTestUser();

    const createResponse = await createTestContact(token);
    const contactId = createResponse.body.data.contact.id;

    const response = await request(app)
      .patch(`/api/contacts/${contactId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "At least one valid contact field must be provided.",
      errors: []
    });
  });

  test("GET /api/contacts/:id - Should return not found for unknown contact", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .get(`/api/contacts/${UNKNOWN_ID}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Contact not found.",
      errors: []
    });
  });

  test("PATCH /api/contacts/:id - Should return not found for unknown contact", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .patch(`/api/contacts/${UNKNOWN_ID}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        company: "Wayne Industries"
      });

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Contact not found.",
      errors: []
    });
  });

  test("DELETE /api/contacts/:id - Should return not found for unknown contact", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .delete(`/api/contacts/${UNKNOWN_ID}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Contact not found.",
      errors: []
    });
  });

  test("GET /api/contacts - Should reject request without authentication token", async function () {
    const response = await request(app).get("/api/contacts");

    expectAuthenticationRequired(response);
  });

  test("POST /api/contacts - Should reject request without authentication token", async function () {
    const response = await request(app)
      .post("/api/contacts")
      .send(CONTACT_PAYLOAD);

    expectAuthenticationRequired(response);
  });

  test("GET /api/contacts/:id - Should reject request without authentication token", async function () {
    const response = await request(app).get(`/api/contacts/${UNKNOWN_ID}`);

    expectAuthenticationRequired(response);
  });

  test("PATCH /api/contacts/:id - Should reject request without authentication token", async function () {
    const response = await request(app)
      .patch(`/api/contacts/${UNKNOWN_ID}`)
      .send(UPDATED_CONTACT_PAYLOAD);

    expectAuthenticationRequired(response);
  });

  test("DELETE /api/contacts/:id - Should reject request without authentication token", async function () {
    const response = await request(app).delete(`/api/contacts/${UNKNOWN_ID}`);

    expectAuthenticationRequired(response);
  });
});
