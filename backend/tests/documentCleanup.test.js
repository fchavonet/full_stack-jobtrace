import { Buffer } from "node:buffer";
import fs from "fs/promises";

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
import prisma from "../src/config/prisma.js";

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

const DOCUMENT_FILE_CONTENT = Buffer.from(
  "%PDF-1.4\nJobTrace invalid document\n"
);

async function cleanUploadedDocuments() {
  await fs.mkdir(uploadDirectory, {
    recursive: true
  });

  const uploadedFiles =
    await fs.readdir(uploadDirectory);

  for (const uploadedFile of uploadedFiles) {
    if (uploadedFile !== ".gitkeep") {
      await fs.rm(
        uploadDirectory + "/" + uploadedFile,
        {
          force: true,
          recursive: true
        }
      );
    }
  }
}

beforeEach(async function () {
  vi.restoreAllMocks();
  await cleanUploadedDocuments();
  await cleanDatabase();
});

afterAll(async function () {
  await cleanUploadedDocuments();
  await disconnectDatabase();
});

describe("Document upload cleanup", function () {
  test("Should restore document file when database deletion fails", async function () {
    const { token } =
      await createAuthenticatedTestUser();

    const createResponse = await request(app)
      .post("/api/documents")
      .set("Authorization", "Bearer " + token)
      .field("type", "resume")
      .attach(
        "document",
        DOCUMENT_FILE_CONTENT,
        {
          filename: "deletion-error.pdf",
          contentType: "application/pdf"
        }
      );

    expect(createResponse.status).toBe(201);

    const document =
      createResponse.body.data.document;

    const documentPath =
      uploadDirectory
      + "/"
      + document.storedName;

    vi.spyOn(
      prisma.document,
      "delete"
    ).mockRejectedValueOnce(
      new Error("Database unavailable.")
    );

    const deleteResponse = await request(app)
      .delete(
        "/api/documents/" + document.id
      )
      .set(
        "Authorization",
        "Bearer " + token
      );

    expect(deleteResponse.status).toBe(500);

    const documentCount =
      await prisma.document.count();

    expect(documentCount).toBe(1);

    await expect(
      fs.access(documentPath)
    ).resolves.toBeUndefined();

    const uploadedFiles =
      await fs.readdir(uploadDirectory);

    const deletionQueueFiles =
      uploadedFiles.filter(function (fileName) {
        return fileName.includes(".deleting-");
      });

    expect(deletionQueueFiles).toEqual([]);
  });

  test("Should remove uploaded file when database creation fails", async function () {
    const { token } =
      await createAuthenticatedTestUser();

    vi.spyOn(
      prisma.document,
      "create"
    ).mockRejectedValueOnce(
      new Error("Database unavailable.")
    );

    const response = await request(app)
      .post("/api/documents")
      .set("Authorization", "Bearer " + token)
      .field("type", "resume")
      .attach(
        "document",
        DOCUMENT_FILE_CONTENT,
        {
          filename: "database-error.pdf",
          contentType: "application/pdf"
        }
      );

    expect(response.status).toBe(500);

    const uploadedFiles =
      await fs.readdir(uploadDirectory);

    const storedDocuments =
      uploadedFiles.filter(function (fileName) {
        return fileName !== ".gitkeep";
      });

    expect(storedDocuments).toEqual([]);

    const documentCount =
      await prisma.document.count();

    expect(documentCount).toBe(0);
  });

  test("Should remove uploaded file when document data is invalid", async function () {
    const { token } =
      await createAuthenticatedTestUser();

    const response = await request(app)
      .post("/api/documents")
      .set("Authorization", "Bearer " + token)
      .field("type", "invalid")
      .attach(
        "document",
        DOCUMENT_FILE_CONTENT,
        {
          filename: "invalid-document.pdf",
          contentType: "application/pdf"
        }
      );

    expect(response.status).toBe(400);

    const uploadedFiles =
      await fs.readdir(uploadDirectory);

    const storedDocuments =
      uploadedFiles.filter(function (fileName) {
        return fileName !== ".gitkeep";
      });

    expect(storedDocuments).toEqual([]);
  });
});
