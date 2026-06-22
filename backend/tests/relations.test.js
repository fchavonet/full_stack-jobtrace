import fs from "fs/promises";

import request from "supertest";
import { afterAll, beforeEach, describe, expect, test } from "vitest";

import app from "../src/app.js";

import {
  uploadDirectory
} from "../src/middlewares/documentUpload.middleware.js";

import {
  cleanDatabase,
  disconnectDatabase
} from "./helpers/test-db.js";

import {
  createAuthenticatedTestUser
} from "./helpers/test-auth.js";

const UNKNOWN_ID = "00000000-0000-0000-0000-000000000000";

const APPLICATION_PAYLOAD = {
  company: "Wayne Enterprises",
  position: "Robin",
  status: "sent",
  contractType: "permanent",
  location: "Gotham City",
  salary: 50000,
  link: "https://careers.wayne-enterprises.example/jobs/robin",
  notes: "Application used for relation route validation.",
  sentAt: "2026-06-21",
  followUpAt: "2026-07-06",
  interviewAt: null
};

const TAG_PAYLOAD = {
  name: "Priority",
  color: "#ffee00"
};

const CONTACT_PAYLOAD = {
  firstName: "Bruce",
  lastName: "Wayne",
  email: "bruce.wayne@wayne-enterprises.example",
  phoneNumber: "0600000000",
  company: "Wayne Enterprises",
  notes: "Contact used for relation route validation."
};

const DOCUMENT_TYPE = "resume";
const DOCUMENT_FILE_NAME = "resume.pdf";
const DOCUMENT_FILE_CONTENT = Buffer.from("%PDF-1.4\nJobTrace relation test document\n");

const AUTH_REQUIRED_RESPONSE = {
  success: false,
  message: "Authentication token is required.",
  errors: []
};

function expectAuthenticationRequired(response) {
  expect(response.status).toBe(401);
  expect(response.body).toEqual(AUTH_REQUIRED_RESPONSE);
}

async function cleanUploadedDocuments() {
  await fs.mkdir(uploadDirectory, {
    recursive: true
  });

  const uploadedFiles = await fs.readdir(uploadDirectory);

  for (const uploadedFile of uploadedFiles) {
    if (uploadedFile !== ".gitkeep") {
      await fs.rm(`${uploadDirectory}/${uploadedFile}`, {
        recursive: true,
        force: true
      });
    }
  }
}

async function createTestApplication(token) {
  const response = await request(app)
    .post("/api/applications")
    .set("Authorization", `Bearer ${token}`)
    .send(APPLICATION_PAYLOAD);

  return response.body.data.application;
}

async function createTestTag(token) {
  const response = await request(app)
    .post("/api/tags")
    .set("Authorization", `Bearer ${token}`)
    .send(TAG_PAYLOAD);

  return response.body.data.tag;
}

async function createTestContact(token) {
  const response = await request(app)
    .post("/api/contacts")
    .set("Authorization", `Bearer ${token}`)
    .send(CONTACT_PAYLOAD);

  return response.body.data.contact;
}

async function createTestDocument(token) {
  const response = await request(app)
    .post("/api/documents")
    .set("Authorization", `Bearer ${token}`)
    .field("type", DOCUMENT_TYPE)
    .attach("document", DOCUMENT_FILE_CONTENT, {
      filename: DOCUMENT_FILE_NAME,
      contentType: "application/pdf"
    });

  return response.body.data.document;
}

beforeEach(async function () {
  await cleanUploadedDocuments();
  await cleanDatabase();
});

afterAll(async function () {
  await cleanUploadedDocuments();
  await disconnectDatabase();
});

describe("Relation routes", function () {
  test("POST /api/applications/:id/tags - Should link tag to authenticated user application", async function () {
    const { token } = await createAuthenticatedTestUser();

    const application = await createTestApplication(token);
    const tag = await createTestTag(token);

    const response = await request(app)
      .post(`/api/applications/${application.id}/tags`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        tagId: tag.id
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Tag linked to application successfully.");

    expect(response.body.data.application.tags).toHaveLength(1);
    expect(response.body.data.application.tags[0]).toMatchObject({
      id: tag.id,
      name: TAG_PAYLOAD.name,
      slug: "priority",
      color: TAG_PAYLOAD.color
    });

    expect(response.body.data.application.tags[0].linkedAt).toEqual(expect.any(String));
  });

  test("POST /api/applications/:id/tags - Should not duplicate existing tag link", async function () {
    const { token } = await createAuthenticatedTestUser();

    const application = await createTestApplication(token);
    const tag = await createTestTag(token);

    await request(app)
      .post(`/api/applications/${application.id}/tags`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        tagId: tag.id
      });

    const response = await request(app)
      .post(`/api/applications/${application.id}/tags`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        tagId: tag.id
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Tag linked to application successfully.");

    expect(response.body.data.application.tags).toHaveLength(1);
  });

  test("DELETE /api/applications/:id/tags/:tagId - Should unlink tag from authenticated user application", async function () {
    const { token } = await createAuthenticatedTestUser();

    const application = await createTestApplication(token);
    const tag = await createTestTag(token);

    await request(app)
      .post(`/api/applications/${application.id}/tags`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        tagId: tag.id
      });

    const response = await request(app)
      .delete(`/api/applications/${application.id}/tags/${tag.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Tag unlinked from application successfully.");

    expect(response.body.data.application.tags).toHaveLength(0);
  });

  test("POST /api/applications/:id/tags - Should reject missing tag id", async function () {
    const { token } = await createAuthenticatedTestUser();

    const application = await createTestApplication(token);

    const response = await request(app)
      .post(`/api/applications/${application.id}/tags`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid application tag data.",
      errors: [
        "Tag id is required."
      ]
    });
  });

  test("POST /api/applications/:id/tags - Should return not found for unknown application or tag", async function () {
    const { token } = await createAuthenticatedTestUser();

    const application = await createTestApplication(token);

    const response = await request(app)
      .post(`/api/applications/${application.id}/tags`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        tagId: UNKNOWN_ID
      });

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Application or tag not found.",
      errors: []
    });
  });

  test("DELETE /api/applications/:id/tags/:tagId - Should return not found for missing tag link", async function () {
    const { token } = await createAuthenticatedTestUser();

    const application = await createTestApplication(token);
    const tag = await createTestTag(token);

    const response = await request(app)
      .delete(`/api/applications/${application.id}/tags/${tag.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Application tag link not found.",
      errors: []
    });
  });

  test("POST /api/applications/:id/contacts - Should link contact to authenticated user application", async function () {
    const { token } = await createAuthenticatedTestUser();

    const application = await createTestApplication(token);
    const contact = await createTestContact(token);

    const response = await request(app)
      .post(`/api/applications/${application.id}/contacts`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        contactId: contact.id,
        role: "recruiter"
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Contact linked to application successfully.");

    expect(response.body.data.application.contacts).toHaveLength(1);
    expect(response.body.data.application.contacts[0]).toMatchObject({
      id: contact.id,
      firstName: CONTACT_PAYLOAD.firstName,
      lastName: CONTACT_PAYLOAD.lastName,
      email: CONTACT_PAYLOAD.email,
      phoneNumber: CONTACT_PAYLOAD.phoneNumber,
      company: CONTACT_PAYLOAD.company,
      notes: CONTACT_PAYLOAD.notes,
      role: "recruiter"
    });

    expect(response.body.data.application.contacts[0].linkedAt).toEqual(expect.any(String));
  });

  test("POST /api/applications/:id/contacts - Should update existing contact link role", async function () {
    const { token } = await createAuthenticatedTestUser();

    const application = await createTestApplication(token);
    const contact = await createTestContact(token);

    await request(app)
      .post(`/api/applications/${application.id}/contacts`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        contactId: contact.id,
        role: "recruiter"
      });

    const response = await request(app)
      .post(`/api/applications/${application.id}/contacts`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        contactId: contact.id,
        role: "manager"
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Contact linked to application successfully.");

    expect(response.body.data.application.contacts).toHaveLength(1);
    expect(response.body.data.application.contacts[0]).toMatchObject({
      id: contact.id,
      role: "manager"
    });
  });

  test("DELETE /api/applications/:id/contacts/:contactId - Should unlink contact from authenticated user application", async function () {
    const { token } = await createAuthenticatedTestUser();

    const application = await createTestApplication(token);
    const contact = await createTestContact(token);

    await request(app)
      .post(`/api/applications/${application.id}/contacts`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        contactId: contact.id,
        role: "recruiter"
      });

    const response = await request(app)
      .delete(`/api/applications/${application.id}/contacts/${contact.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Contact unlinked from application successfully.");

    expect(response.body.data.application.contacts).toHaveLength(0);
  });

  test("POST /api/applications/:id/contacts - Should reject missing contact id", async function () {
    const { token } = await createAuthenticatedTestUser();

    const application = await createTestApplication(token);

    const response = await request(app)
      .post(`/api/applications/${application.id}/contacts`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        role: "recruiter"
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid application contact data.",
      errors: [
        "Contact id is required."
      ]
    });
  });

  test("POST /api/applications/:id/contacts - Should return not found for unknown application or contact", async function () {
    const { token } = await createAuthenticatedTestUser();

    const application = await createTestApplication(token);

    const response = await request(app)
      .post(`/api/applications/${application.id}/contacts`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        contactId: UNKNOWN_ID,
        role: "recruiter"
      });

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Application or contact not found.",
      errors: []
    });
  });

  test("DELETE /api/applications/:id/contacts/:contactId - Should return not found for missing contact link", async function () {
    const { token } = await createAuthenticatedTestUser();

    const application = await createTestApplication(token);
    const contact = await createTestContact(token);

    const response = await request(app)
      .delete(`/api/applications/${application.id}/contacts/${contact.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Application contact link not found.",
      errors: []
    });
  });

  test("POST /api/applications/:id/documents - Should link document to authenticated user application", async function () {
    const { token } = await createAuthenticatedTestUser();

    const application = await createTestApplication(token);
    const document = await createTestDocument(token);

    const response = await request(app)
      .post(`/api/applications/${application.id}/documents`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        documentId: document.id
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Document linked to application successfully.");

    expect(response.body.data.application.documents).toHaveLength(1);
    expect(response.body.data.application.documents[0]).toMatchObject({
      id: document.id,
      type: DOCUMENT_TYPE,
      originalName: DOCUMENT_FILE_NAME,
      mimeType: "application/pdf",
      size: DOCUMENT_FILE_CONTENT.length
    });

    expect(response.body.data.application.documents[0].storedName).toEqual(expect.any(String));
    expect(response.body.data.application.documents[0].linkedAt).toEqual(expect.any(String));
  });

  test("POST /api/applications/:id/documents - Should not duplicate existing document link", async function () {
    const { token } = await createAuthenticatedTestUser();

    const application = await createTestApplication(token);
    const document = await createTestDocument(token);

    await request(app)
      .post(`/api/applications/${application.id}/documents`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        documentId: document.id
      });

    const response = await request(app)
      .post(`/api/applications/${application.id}/documents`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        documentId: document.id
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Document linked to application successfully.");

    expect(response.body.data.application.documents).toHaveLength(1);
  });

  test("DELETE /api/applications/:id/documents/:documentId - Should unlink document from authenticated user application", async function () {
    const { token } = await createAuthenticatedTestUser();

    const application = await createTestApplication(token);
    const document = await createTestDocument(token);

    await request(app)
      .post(`/api/applications/${application.id}/documents`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        documentId: document.id
      });

    const response = await request(app)
      .delete(`/api/applications/${application.id}/documents/${document.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Document unlinked from application successfully.");

    expect(response.body.data.application.documents).toHaveLength(0);
  });

  test("POST /api/applications/:id/documents - Should reject missing document id", async function () {
    const { token } = await createAuthenticatedTestUser();

    const application = await createTestApplication(token);

    const response = await request(app)
      .post(`/api/applications/${application.id}/documents`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid application document data.",
      errors: [
        "Document id is required."
      ]
    });
  });

  test("POST /api/applications/:id/documents - Should return not found for unknown application or document", async function () {
    const { token } = await createAuthenticatedTestUser();

    const application = await createTestApplication(token);

    const response = await request(app)
      .post(`/api/applications/${application.id}/documents`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        documentId: UNKNOWN_ID
      });

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Application or document not found.",
      errors: []
    });
  });

  test("DELETE /api/applications/:id/documents/:documentId - Should return not found for missing document link", async function () {
    const { token } = await createAuthenticatedTestUser();

    const application = await createTestApplication(token);
    const document = await createTestDocument(token);

    const response = await request(app)
      .delete(`/api/applications/${application.id}/documents/${document.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Application document link not found.",
      errors: []
    });
  });

  test("GET /api/applications/:id/history - Should return history for application relations", async function () {
    const { token } = await createAuthenticatedTestUser();

    const application = await createTestApplication(token);
    const tag = await createTestTag(token);
    const contact = await createTestContact(token);
    const document = await createTestDocument(token);

    await request(app)
      .post(`/api/applications/${application.id}/tags`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        tagId: tag.id
      });

    await request(app)
      .post(`/api/applications/${application.id}/contacts`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        contactId: contact.id,
        role: "recruiter"
      });

    await request(app)
      .post(`/api/applications/${application.id}/documents`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        documentId: document.id
      });

    const response = await request(app)
      .get(`/api/applications/${application.id}/history`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Application history retrieved successfully.");

    const actions = response.body.data.history.map(function (historyEntry) {
      return historyEntry.action;
    });

    expect(actions).toEqual(expect.arrayContaining([
      "application_created",
      "tag_linked",
      "contact_linked",
      "document_linked"
    ]));

    expect(response.body.data.history[0]).toMatchObject({
      id: expect.any(String),
      action: expect.any(String),
      metadata: expect.any(Object),
      createdAt: expect.any(String)
    });
  });

  test("GET /api/applications/:id/history - Should return not found for unknown application", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .get(`/api/applications/${UNKNOWN_ID}/history`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Application not found.",
      errors: []
    });
  });

  test("POST /api/applications/:id/tags - Should reject request without authentication token", async function () {
    const response = await request(app)
      .post(`/api/applications/${UNKNOWN_ID}/tags`)
      .send({
        tagId: UNKNOWN_ID
      });

    expectAuthenticationRequired(response);
  });

  test("DELETE /api/applications/:id/tags/:tagId - Should reject request without authentication token", async function () {
    const response = await request(app)
      .delete(`/api/applications/${UNKNOWN_ID}/tags/${UNKNOWN_ID}`);

    expectAuthenticationRequired(response);
  });

  test("POST /api/applications/:id/contacts - Should reject request without authentication token", async function () {
    const response = await request(app)
      .post(`/api/applications/${UNKNOWN_ID}/contacts`)
      .send({
        contactId: UNKNOWN_ID,
        role: "recruiter"
      });

    expectAuthenticationRequired(response);
  });

  test("DELETE /api/applications/:id/contacts/:contactId - Should reject request without authentication token", async function () {
    const response = await request(app)
      .delete(`/api/applications/${UNKNOWN_ID}/contacts/${UNKNOWN_ID}`);

    expectAuthenticationRequired(response);
  });

  test("POST /api/applications/:id/documents - Should reject request without authentication token", async function () {
    const response = await request(app)
      .post(`/api/applications/${UNKNOWN_ID}/documents`)
      .send({
        documentId: UNKNOWN_ID
      });

    expectAuthenticationRequired(response);
  });

  test("DELETE /api/applications/:id/documents/:documentId - Should reject request without authentication token", async function () {
    const response = await request(app)
      .delete(`/api/applications/${UNKNOWN_ID}/documents/${UNKNOWN_ID}`);

    expectAuthenticationRequired(response);
  });
});
