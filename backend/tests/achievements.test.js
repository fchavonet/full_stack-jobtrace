import { Buffer } from "node:buffer";
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

const EXPECTED_ACHIEVEMENT_SLUGS = [
  "first-application",
  "first-follow-up",
  "first-tag",
  "first-contact",
  "first-document",
  "first-interview",
  "first-daily-goal",
  "first-monthly-goal",
  "ten-applications",
  "fifty-applications"
];

const APPLICATION_PAYLOAD = {
  company: "Wayne Enterprises",
  position: "Robin",
  status: "sent",
  contractType: "permanent",
  location: "Gotham City",
  salary: 50000,
  link: "https://careers.wayne-enterprises.example/jobs/robin",
  notes: "Application used for achievement validation.",
  sentAt: "2026-06-21",
  followUpAt: null,
  interviewAt: null
};

const FOLLOW_UP_APPLICATION_PAYLOAD = {
  company: "Wayne Enterprises",
  position: "Nightwing",
  status: "sent",
  contractType: "permanent",
  location: "Blüdhaven",
  salary: 60000,
  link: "https://careers.wayne-enterprises.example/jobs/nightwing",
  notes: "Application with follow-up date used for achievement validation.",
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
  notes: "Contact used for achievement validation."
};

const DOCUMENT_TYPE = "resume";
const DOCUMENT_FILE_NAME = "resume.pdf";
const DOCUMENT_FILE_CONTENT = Buffer.from("%PDF-1.4\nJobTrace achievement test document\n");

const AUTH_REQUIRED_RESPONSE = {
  success: false,
  message: "Authentication token is required.",
  errors: []
};

function expectAuthenticationRequired(response) {
  expect(response.status).toBe(401);
  expect(response.body).toEqual(AUTH_REQUIRED_RESPONSE);
}

function findAchievement(achievements, slug) {
  return achievements.find(function (achievement) {
    return achievement.slug === slug;
  });
}

function expectAchievementFields(achievement, expected = {}) {
  expect(achievement).toMatchObject({
    name: expect.any(String),
    slug: expect.any(String),
    description: expect.any(String),
    icon: expect.any(String),
    unlocked: expect.any(Boolean),
    ...expected
  });

  expect(achievement.id).toEqual(expect.any(String));
  expect(achievement.createdAt).toEqual(expect.any(String));
}

function expectUnlockedAchievement(achievements, slug) {
  const achievement = findAchievement(achievements, slug);

  expect(achievement).toBeDefined();
  expectAchievementFields(achievement, {
    slug,
    unlocked: true
  });
  expect(achievement.unlockedAt).toEqual(expect.any(String));
}

function expectLockedAchievement(achievements, slug) {
  const achievement = findAchievement(achievements, slug);

  expect(achievement).toBeDefined();
  expectAchievementFields(achievement, {
    slug,
    unlocked: false,
    unlockedAt: null
  });
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

async function getAchievements(token) {
  const response = await request(app)
    .get("/api/achievements")
    .set("Authorization", `Bearer ${token}`);

  return response;
}

async function createTestApplication(token, payload = APPLICATION_PAYLOAD) {
  const response = await request(app)
    .post("/api/applications")
    .set("Authorization", `Bearer ${token}`)
    .send(payload);

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

describe("Achievement routes", function () {
  test("GET /api/achievements - Should return default locked achievements", async function () {
    const { token } = await createAuthenticatedTestUser();

    const response = await getAchievements(token);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Achievements retrieved successfully.");

    expect(response.body.data.achievements).toHaveLength(EXPECTED_ACHIEVEMENT_SLUGS.length);

    const slugs = response.body.data.achievements.map(function (achievement) {
      return achievement.slug;
    });

    expect(slugs).toEqual(EXPECTED_ACHIEVEMENT_SLUGS);

    for (const achievement of response.body.data.achievements) {
      expectAchievementFields(achievement, {
        unlocked: false,
        unlockedAt: null
      });
    }
  });

  test("GET /api/achievements - Should unlock first application achievement", async function () {
    const { token } = await createAuthenticatedTestUser();

    await createTestApplication(token);

    const response = await getAchievements(token);

    expect(response.status).toBe(200);

    expectUnlockedAchievement(response.body.data.achievements, "first-application");
    expectLockedAchievement(response.body.data.achievements, "first-tag");
    expectLockedAchievement(response.body.data.achievements, "first-contact");
    expectLockedAchievement(response.body.data.achievements, "first-document");
  });

  test("GET /api/achievements - Should unlock first follow-up achievement", async function () {
    const { token } = await createAuthenticatedTestUser();

    await createTestApplication(token, FOLLOW_UP_APPLICATION_PAYLOAD);

    const response = await getAchievements(token);

    expect(response.status).toBe(200);

    expectUnlockedAchievement(response.body.data.achievements, "first-application");
    expectUnlockedAchievement(response.body.data.achievements, "first-follow-up");
  });

  test("GET /api/achievements - Should unlock ten applications achievement", async function () {
    const { token } = await createAuthenticatedTestUser();

    for (let applicationIndex = 1; applicationIndex <= 10; applicationIndex += 1) {
      await createTestApplication(token, {
        ...APPLICATION_PAYLOAD,
        company: `Wayne Enterprises ${applicationIndex}`,
        position: `Robin ${applicationIndex}`
      });
    }

    const response = await getAchievements(token);

    expect(response.status).toBe(200);

    expectUnlockedAchievement(response.body.data.achievements, "first-application");
    expectUnlockedAchievement(response.body.data.achievements, "ten-applications");
  });

  test("GET /api/achievements - Should unlock first tag achievement", async function () {
    const { token } = await createAuthenticatedTestUser();

    await createTestTag(token);

    const response = await getAchievements(token);

    expect(response.status).toBe(200);

    expectUnlockedAchievement(response.body.data.achievements, "first-tag");
    expectLockedAchievement(response.body.data.achievements, "first-application");
  });

  test("GET /api/achievements - Should unlock first contact achievement", async function () {
    const { token } = await createAuthenticatedTestUser();

    await createTestContact(token);

    const response = await getAchievements(token);

    expect(response.status).toBe(200);

    expectUnlockedAchievement(response.body.data.achievements, "first-contact");
    expectLockedAchievement(response.body.data.achievements, "first-application");
  });

  test("GET /api/achievements - Should unlock first document achievement", async function () {
    const { token } = await createAuthenticatedTestUser();

    await createTestDocument(token);

    const response = await getAchievements(token);

    expect(response.status).toBe(200);

    expectUnlockedAchievement(response.body.data.achievements, "first-document");
    expectLockedAchievement(response.body.data.achievements, "first-application");
  });

  test("GET /api/achievements - Should keep relation actions without extra achievement", async function () {
    const { token } = await createAuthenticatedTestUser();

    const application = await createTestApplication(token);
    const tag = await createTestTag(token);

    await request(app)
      .post(`/api/applications/${application.id}/tags`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        tagId: tag.id
      });

    const response = await getAchievements(token);

    expect(response.status).toBe(200);

    expectUnlockedAchievement(response.body.data.achievements, "first-application");
    expectUnlockedAchievement(response.body.data.achievements, "first-tag");
    expectLockedAchievement(response.body.data.achievements, "first-follow-up");
  });

  test("GET /api/achievements - Should keep achievements scoped to authenticated user", async function () {
    const firstUser = await createAuthenticatedTestUser();

    await createTestApplication(firstUser.token);
    await createTestTag(firstUser.token);

    const firstUserAchievementsResponse = await getAchievements(firstUser.token);

    expect(firstUserAchievementsResponse.status).toBe(200);
    expectUnlockedAchievement(firstUserAchievementsResponse.body.data.achievements, "first-application");
    expectUnlockedAchievement(firstUserAchievementsResponse.body.data.achievements, "first-tag");

    await cleanDatabase();

    const secondUser = await createAuthenticatedTestUser();

    const secondUserAchievementsResponse = await getAchievements(secondUser.token);

    expect(secondUserAchievementsResponse.status).toBe(200);
    expectLockedAchievement(secondUserAchievementsResponse.body.data.achievements, "first-application");
    expectLockedAchievement(secondUserAchievementsResponse.body.data.achievements, "first-tag");
  });

  test("GET /api/achievements - Should reject request without authentication token", async function () {
    const response = await request(app).get("/api/achievements");

    expectAuthenticationRequired(response);
  });
});
