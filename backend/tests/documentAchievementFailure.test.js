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
  unlockFirstDocumentAchievement
} from "../src/services/achievement.service.js";

import {
  cleanDatabase,
  disconnectDatabase
} from "./helpers/test-db.js";

import {
  createAuthenticatedTestUser
} from "./helpers/test-auth.js";

vi.mock(
  "../src/services/achievement.service.js",
  function () {
    return {
      unlockFirstDocumentAchievement: vi.fn()
    };
  }
);

const DOCUMENT_FILE_CONTENT = Buffer.from(
  "%PDF-1.4\nJobTrace achievement failure test\n"
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
  vi.clearAllMocks();
  vi.restoreAllMocks();

  vi.spyOn(
    globalThis.console,
    "error"
  ).mockImplementation(function () {});

  await cleanUploadedDocuments();
  await cleanDatabase();
});

afterAll(async function () {
  vi.restoreAllMocks();

  await cleanUploadedDocuments();
  await disconnectDatabase();
});

describe(
  "Document achievement failure",
  function () {
    test(
      "Should preserve uploaded document when achievement unlocking fails",
      async function () {
        const { token } =
          await createAuthenticatedTestUser();

        unlockFirstDocumentAchievement
          .mockRejectedValueOnce(
            new Error("Achievement unavailable.")
          );

        const response = await request(app)
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
              filename: "achievement-error.pdf",
              contentType: "application/pdf"
            }
          );

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);

        const document =
          response.body.data.document;

        const documentCount =
          await prisma.document.count();

        expect(documentCount).toBe(1);

        await expect(
          fs.access(
            uploadDirectory
              + "/"
              + document.storedName
          )
        ).resolves.toBeUndefined();

        expect(
          globalThis.console.error
        ).toHaveBeenCalledTimes(1);
      }
    );
  }
);
