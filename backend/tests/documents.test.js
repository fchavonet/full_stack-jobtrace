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

const DOCUMENT_TYPE = "resume";
const UPDATED_DOCUMENT_TYPE = "cover_letter";
const DOCUMENT_FILE_NAME = "resume.pdf";
const DOCUMENT_FILE_CONTENT = Buffer.from("%PDF-1.4\nJobTrace test document\n");
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

function expectDocumentFields(document, expected = {}) {
  expect(document).toMatchObject({
    type: DOCUMENT_TYPE,
    originalName: DOCUMENT_FILE_NAME,
    mimeType: "application/pdf",
    size: DOCUMENT_FILE_CONTENT.length,
    ...expected
  });

  expect(document.id).toEqual(expect.any(String));
  expect(document.storedName).toEqual(expect.any(String));
  expect(document.createdAt).toEqual(expect.any(String));
  expect(document.updatedAt).toEqual(expect.any(String));
}

async function cleanUploadedDocuments() {
  await fs.rm(uploadDirectory, {
    recursive: true,
    force: true
  });
}

async function createTestDocument(token, type = DOCUMENT_TYPE) {
  const response = await request(app)
    .post("/api/documents")
    .set("Authorization", `Bearer ${token}`)
    .field("type", type)
    .attach("document", DOCUMENT_FILE_CONTENT, {
      filename: DOCUMENT_FILE_NAME,
      contentType: "application/pdf"
    });

  return response;
}

beforeEach(async function () {
  await cleanUploadedDocuments();
  await cleanDatabase();
});

afterAll(async function () {
  await cleanUploadedDocuments();
  await disconnectDatabase();
});

describe("Document routes", function () {
  test("POST /api/documents - Should upload authenticated user document", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await createTestDocument(token);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Document uploaded successfully.");

    expectDocumentFields(response.body.data.document);
  });

  test("GET /api/documents - Should return authenticated user documents", async function () {
    const { token } = await createAuthenticatedTestUser();

    await createTestDocument(token);

    const response = await request(app)
      .get("/api/documents")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Documents retrieved successfully.");

    expect(response.body.data.documents).toHaveLength(1);
    expectDocumentFields(response.body.data.documents[0]);
  });

  test("GET /api/documents/:id - Should return authenticated user document", async function () {
    const { token } = await createAuthenticatedTestUser();

    const createResponse = await createTestDocument(token);
    const documentId = createResponse.body.data.document.id;

    const response = await request(app)
      .get(`/api/documents/${documentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Document retrieved successfully.");

    expectDocumentFields(response.body.data.document);
  });

  test("PATCH /api/documents/:id - Should update authenticated user document type", async function () {
    const { token } = await createAuthenticatedTestUser();

    const createResponse = await createTestDocument(token);
    const documentId = createResponse.body.data.document.id;

    const response = await request(app)
      .patch(`/api/documents/${documentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: UPDATED_DOCUMENT_TYPE
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Document updated successfully.");

    expectDocumentFields(response.body.data.document, {
      type: UPDATED_DOCUMENT_TYPE
    });
  });

  test("GET /api/documents/:id/download - Should download authenticated user document", async function () {
    const { token } = await createAuthenticatedTestUser();

    const createResponse = await createTestDocument(token);
    const documentId = createResponse.body.data.document.id;

    const response = await request(app)
      .get(`/api/documents/${documentId}/download`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.headers["content-disposition"]).toContain(DOCUMENT_FILE_NAME);
    expect(response.headers["content-type"]).toContain("application/pdf");
  });

  test("DELETE /api/documents/:id - Should delete authenticated user document", async function () {
    const { token } = await createAuthenticatedTestUser();

    const createResponse = await createTestDocument(token);
    const documentId = createResponse.body.data.document.id;

    const deleteResponse = await request(app)
      .delete(`/api/documents/${documentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);
    expect(deleteResponse.body.message).toBe("Document deleted successfully.");

    expectDocumentFields(deleteResponse.body.data.document);

    const getResponse = await request(app)
      .get(`/api/documents/${documentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getResponse.status).toBe(404);

    expect(getResponse.body).toEqual({
      success: false,
      message: "Document not found.",
      errors: []
    });
  });

  test("POST /api/documents - Should reject missing document file", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .post("/api/documents")
      .set("Authorization", `Bearer ${token}`)
      .field("type", DOCUMENT_TYPE);

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid document data.",
      errors: [
        "Document file is required."
      ]
    });
  });

  test("POST /api/documents - Should reject missing document type", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .post("/api/documents")
      .set("Authorization", `Bearer ${token}`)
      .attach("document", DOCUMENT_FILE_CONTENT, {
        filename: DOCUMENT_FILE_NAME,
        contentType: "application/pdf"
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid document data.",
      errors: [
        "Document type is required."
      ]
    });
  });

  test("POST /api/documents - Should reject invalid document type", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await createTestDocument(token, "invalid");

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid document data.",
      errors: [
        "Document type is invalid."
      ]
    });
  });

  test("POST /api/documents - Should reject invalid document file type", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .post("/api/documents")
      .set("Authorization", `Bearer ${token}`)
      .field("type", DOCUMENT_TYPE)
      .attach("document", Buffer.from("invalid file"), {
        filename: "resume.txt",
        contentType: "text/plain"
      });

    expect(response.status).toBe(500);

    expect(response.body).toEqual({
      success: false,
      message: "Only PDF, DOC, DOCX, PNG, JPG and JPEG files are allowed.",
      errors: []
    });
  });

  test("PATCH /api/documents/:id - Should reject invalid document type", async function () {
    const { token } = await createAuthenticatedTestUser();

    const createResponse = await createTestDocument(token);
    const documentId = createResponse.body.data.document.id;

    const response = await request(app)
      .patch(`/api/documents/${documentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "invalid"
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid document data.",
      errors: [
        "Document type is invalid."
      ]
    });
  });

  test("PATCH /api/documents/:id - Should reject missing document type", async function () {
    const { token } = await createAuthenticatedTestUser();

    const createResponse = await createTestDocument(token);
    const documentId = createResponse.body.data.document.id;

    const response = await request(app)
      .patch(`/api/documents/${documentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid document data.",
      errors: [
        "Document type is required."
      ]
    });
  });

  test("GET /api/documents/:id - Should return not found for unknown document", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .get(`/api/documents/${UNKNOWN_ID}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Document not found.",
      errors: []
    });
  });

  test("PATCH /api/documents/:id - Should return not found for unknown document", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .patch(`/api/documents/${UNKNOWN_ID}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: UPDATED_DOCUMENT_TYPE
      });

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Document not found.",
      errors: []
    });
  });

  test("GET /api/documents/:id/download - Should return not found for unknown document", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .get(`/api/documents/${UNKNOWN_ID}/download`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Document not found.",
      errors: []
    });
  });

  test("DELETE /api/documents/:id - Should return not found for unknown document", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await request(app)
      .delete(`/api/documents/${UNKNOWN_ID}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Document not found.",
      errors: []
    });
  });

  test("GET /api/documents - Should reject request without authentication token", async function () {
    const response = await request(app).get("/api/documents");

    expectAuthenticationRequired(response);
  });

  test("POST /api/documents - Should reject request without authentication token", async function () {
    const response = await request(app)
      .post("/api/documents")
      .field("type", DOCUMENT_TYPE)
      .attach("document", DOCUMENT_FILE_CONTENT, {
        filename: DOCUMENT_FILE_NAME,
        contentType: "application/pdf"
      });

    expectAuthenticationRequired(response);
  });

  test("GET /api/documents/:id - Should reject request without authentication token", async function () {
    const response = await request(app).get(`/api/documents/${UNKNOWN_ID}`);

    expectAuthenticationRequired(response);
  });

  test("PATCH /api/documents/:id - Should reject request without authentication token", async function () {
    const response = await request(app)
      .patch(`/api/documents/${UNKNOWN_ID}`)
      .send({
        type: UPDATED_DOCUMENT_TYPE
      });

    expectAuthenticationRequired(response);
  });

  test("GET /api/documents/:id/download - Should reject request without authentication token", async function () {
    const response = await request(app).get(`/api/documents/${UNKNOWN_ID}/download`);

    expectAuthenticationRequired(response);
  });

  test("DELETE /api/documents/:id - Should reject request without authentication token", async function () {
    const response = await request(app).delete(`/api/documents/${UNKNOWN_ID}`);

    expectAuthenticationRequired(response);
  });
});
