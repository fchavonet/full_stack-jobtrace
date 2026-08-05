import request from "supertest";

import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi
} from "vitest";

import app from "../src/app.js";
import prisma from "../src/config/prisma.js";

import {
  cleanDatabase,
  disconnectDatabase
} from "./helpers/test-db.js";

import {
  createAuthenticatedTestUser
} from "./helpers/test-auth.js";

const APPLICATION_PAYLOAD = {
  company: "Airbus",
  position: "Développeur",
  status: "sent",
  contractType: "permanent",
  location: "Toulouse",
  locationCode: "31555",
  locationLatitude: 43.6043,
  locationLongitude: 1.4437,
  sentAt: "2026-08-05"
};

async function createApplication(token) {
  const response = await request(app)
    .post("/api/applications")
    .set(
      "Authorization",
      "Bearer " + token
    )
    .send(APPLICATION_PAYLOAD);

  expect(response.status).toBe(201);

  return response.body.data.application;
}

async function createTag(userId) {
  return prisma.tag.create({
    data: {
      userId,
      name: "Transaction",
      slug: "transaction",
      color: "#4528e8"
    }
  });
}

async function createContact(userId) {
  return prisma.contact.create({
    data: {
      userId,
      firstName: "Grace",
      lastName: "Hopper",
      email:
        "grace.hopper@jobtrace.test"
    }
  });
}

async function createDocument(userId) {
  return prisma.document.create({
    data: {
      userId,
      type: "resume",
      originalName:
        "transaction-resume.pdf",
      storedName:
        "transaction-resume.pdf",
      mimeType: "application/pdf",
      size: 100,
      path:
        "uploads/test-documents/"
        + "transaction-resume.pdf"
    }
  });
}

async function countHistory(
  applicationId
) {
  return prisma.applicationHistory.count({
    where: {
      applicationId
    }
  });
}

function failNextHistoryWrite() {
  const originalUpdate =
    prisma.application.update.bind(
      prisma.application
    );

  vi.spyOn(
    prisma.application,
    "update"
  ).mockImplementationOnce(
    function (options) {
      return originalUpdate({
        ...options,
        data: {
          ...options.data,
          history: {
            create: {
              ...options.data
                .history.create,
              action: null
            }
          }
        }
      });
    }
  );
}

beforeEach(async function () {
  await cleanDatabase();
});

afterEach(function () {
  vi.restoreAllMocks();
});

afterAll(async function () {
  vi.restoreAllMocks();

  await cleanDatabase();
  await disconnectDatabase();
});

describe(
  "Application relation history transactions",
  function () {
    test(
      "Should rollback tag linking when history creation fails",
      async function () {
        const { token, user } =
          await createAuthenticatedTestUser();

        const application =
          await createApplication(token);

        const tag =
          await createTag(user.id);

        const historyCountBefore =
          await countHistory(
            application.id
          );

        failNextHistoryWrite();

        const response = await request(app)
          .post(
            "/api/applications/"
            + application.id
            + "/tags"
          )
          .set(
            "Authorization",
            "Bearer " + token
          )
          .send({
            tagId: tag.id
          });

        expect(response.status).toBe(500);

        const relationCount =
          await prisma.applicationTag.count({
            where: {
              applicationId:
                application.id,
              tagId: tag.id
            }
          });

        expect(relationCount).toBe(0);

        expect(
          await countHistory(
            application.id
          )
        ).toBe(historyCountBefore);
      }
    );

    test(
      "Should rollback tag unlinking when history creation fails",
      async function () {
        const { token, user } =
          await createAuthenticatedTestUser();

        const application =
          await createApplication(token);

        const tag =
          await createTag(user.id);

        const linkResponse =
          await request(app)
            .post(
              "/api/applications/"
              + application.id
              + "/tags"
            )
            .set(
              "Authorization",
              "Bearer " + token
            )
            .send({
              tagId: tag.id
            });

        expect(
          linkResponse.status
        ).toBe(200);

        const historyCountBefore =
          await countHistory(
            application.id
          );

        failNextHistoryWrite();

        const response = await request(app)
          .delete(
            "/api/applications/"
            + application.id
            + "/tags/"
            + tag.id
          )
          .set(
            "Authorization",
            "Bearer " + token
          );

        expect(response.status).toBe(500);

        const relationCount =
          await prisma.applicationTag.count({
            where: {
              applicationId:
                application.id,
              tagId: tag.id
            }
          });

        expect(relationCount).toBe(1);

        expect(
          await countHistory(
            application.id
          )
        ).toBe(historyCountBefore);
      }
    );

    test(
      "Should rollback contact linking when history creation fails",
      async function () {
        const { token, user } =
          await createAuthenticatedTestUser();

        const application =
          await createApplication(token);

        const contact =
          await createContact(user.id);

        const historyCountBefore =
          await countHistory(
            application.id
          );

        failNextHistoryWrite();

        const response = await request(app)
          .post(
            "/api/applications/"
            + application.id
            + "/contacts"
          )
          .set(
            "Authorization",
            "Bearer " + token
          )
          .send({
            contactId: contact.id,
            role: "recruiter"
          });

        expect(response.status).toBe(500);

        const relationCount =
          await prisma.applicationContact
            .count({
              where: {
                applicationId:
                  application.id,
                contactId:
                  contact.id
              }
            });

        expect(relationCount).toBe(0);

        expect(
          await countHistory(
            application.id
          )
        ).toBe(historyCountBefore);
      }
    );

    test(
      "Should rollback contact unlinking when history creation fails",
      async function () {
        const { token, user } =
          await createAuthenticatedTestUser();

        const application =
          await createApplication(token);

        const contact =
          await createContact(user.id);

        const linkResponse =
          await request(app)
            .post(
              "/api/applications/"
              + application.id
              + "/contacts"
            )
            .set(
              "Authorization",
              "Bearer " + token
            )
            .send({
              contactId: contact.id,
              role: "recruiter"
            });

        expect(
          linkResponse.status
        ).toBe(200);

        const historyCountBefore =
          await countHistory(
            application.id
          );

        failNextHistoryWrite();

        const response = await request(app)
          .delete(
            "/api/applications/"
            + application.id
            + "/contacts/"
            + contact.id
          )
          .set(
            "Authorization",
            "Bearer " + token
          );

        expect(response.status).toBe(500);

        const relationCount =
          await prisma.applicationContact
            .count({
              where: {
                applicationId:
                  application.id,
                contactId:
                  contact.id
              }
            });

        expect(relationCount).toBe(1);

        expect(
          await countHistory(
            application.id
          )
        ).toBe(historyCountBefore);
      }
    );

    test(
      "Should rollback document linking when history creation fails",
      async function () {
        const { token, user } =
          await createAuthenticatedTestUser();

        const application =
          await createApplication(token);

        const document =
          await createDocument(user.id);

        const historyCountBefore =
          await countHistory(
            application.id
          );

        failNextHistoryWrite();

        const response = await request(app)
          .post(
            "/api/applications/"
            + application.id
            + "/documents"
          )
          .set(
            "Authorization",
            "Bearer " + token
          )
          .send({
            documentId: document.id
          });

        expect(response.status).toBe(500);

        const relationCount =
          await prisma.applicationDocument
            .count({
              where: {
                applicationId:
                  application.id,
                documentId:
                  document.id
              }
            });

        expect(relationCount).toBe(0);

        expect(
          await countHistory(
            application.id
          )
        ).toBe(historyCountBefore);
      }
    );

    test(
      "Should rollback document unlinking when history creation fails",
      async function () {
        const { token, user } =
          await createAuthenticatedTestUser();

        const application =
          await createApplication(token);

        const document =
          await createDocument(user.id);

        const linkResponse =
          await request(app)
            .post(
              "/api/applications/"
              + application.id
              + "/documents"
            )
            .set(
              "Authorization",
              "Bearer " + token
            )
            .send({
              documentId: document.id
            });

        expect(
          linkResponse.status
        ).toBe(200);

        const historyCountBefore =
          await countHistory(
            application.id
          );

        failNextHistoryWrite();

        const response = await request(app)
          .delete(
            "/api/applications/"
            + application.id
            + "/documents/"
            + document.id
          )
          .set(
            "Authorization",
            "Bearer " + token
          );

        expect(response.status).toBe(500);

        const relationCount =
          await prisma.applicationDocument
            .count({
              where: {
                applicationId:
                  application.id,
                documentId:
                  document.id
              }
            });

        expect(relationCount).toBe(1);

        expect(
          await countHistory(
            application.id
          )
        ).toBe(historyCountBefore);
      }
    );
  }
);
