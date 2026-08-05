import { Buffer } from "node:buffer";
import fs from "fs/promises";

import request from "supertest";
import {
  afterAll,
  beforeEach,
  describe,
  expect,
  test
} from "vitest";

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
  await cleanUploadedDocuments();
  await cleanDatabase();
});

afterAll(async function () {
  await cleanUploadedDocuments();
  await disconnectDatabase();
});

describe("Document upload cleanup", function () {
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
