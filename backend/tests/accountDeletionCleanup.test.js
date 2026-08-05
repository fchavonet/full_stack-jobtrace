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
  "%PDF-1.4\nJobTrace account deletion test\n"
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
  vi.restoreAllMocks();

  await cleanUploadedDocuments();
  await cleanDatabase();
  await disconnectDatabase();
});

describe(
  "Account deletion file cleanup",
  function () {
    test(
      "Should restore user files when account deletion fails",
      async function () {
        const { token, user } =
          await createAuthenticatedTestUser();

        const uploadResponse = await request(app)
          .post("/api/documents")
          .set(
            "Authorization",
            "Bearer " + token
          )
          .field("type", "resume")
          .attach(
            "document",
            DOCUMENT_FILE_CONTENT,
            {
              filename: "account-error.pdf",
              contentType: "application/pdf"
            }
          );

        expect(uploadResponse.status).toBe(201);

        const document =
          uploadResponse.body.data.document;

        const documentPath =
          uploadDirectory
          + "/"
          + document.storedName;

        vi.spyOn(
          prisma.user,
          "delete"
        ).mockRejectedValueOnce(
          new Error("Database unavailable.")
        );

        const deleteResponse = await request(app)
          .delete("/api/auth/me")
          .set(
            "Authorization",
            "Bearer " + token
          );

        expect(deleteResponse.status).toBe(500);

        const userCount =
          await prisma.user.count({
            where: {
              id: user.id
            }
          });

        const documentCount =
          await prisma.document.count({
            where: {
              id: document.id
            }
          });

        expect(userCount).toBe(1);
        expect(documentCount).toBe(1);

        await expect(
          fs.access(documentPath)
        ).resolves.toBeUndefined();

        const uploadedFiles =
          await fs.readdir(uploadDirectory);

        const pendingDeletionFiles =
          uploadedFiles.filter(
            function (fileName) {
              return fileName.includes(
                ".deleting-"
              );
            }
          );

        expect(
          pendingDeletionFiles
        ).toEqual([]);
      }
    );
  }
);
