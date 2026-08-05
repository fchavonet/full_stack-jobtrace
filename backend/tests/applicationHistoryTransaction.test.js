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
  position: "Développeur full-stack",
  status: "sent",
  contractType: "permanent",
  location: "Toulouse",
  locationCode: "31555",
  locationLatitude: 43.6043,
  locationLongitude: 1.4437,
  sentAt: "2026-08-05"
};

async function createApplication(
  token,
  payload = APPLICATION_PAYLOAD
) {
  return request(app)
    .post("/api/applications")
    .set(
      "Authorization",
      "Bearer " + token
    )
    .send(payload);
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
  "Application history transactions",
  function () {
    test(
      "Should rollback application creation when history creation fails",
      async function () {
        const { token, user } =
          await createAuthenticatedTestUser();

        const originalCreate =
          prisma.application.create.bind(
            prisma.application
          );

        vi.spyOn(
          prisma.application,
          "create"
        ).mockImplementationOnce(
          function (options) {
            return originalCreate({
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

        const response =
          await createApplication(token);

        expect(response.status).toBe(500);

        const applicationCount =
          await prisma.application.count({
            where: {
              userId: user.id
            }
          });

        expect(applicationCount).toBe(0);

        const historyCount =
          await prisma.applicationHistory
            .count({
              where: {
                application: {
                  userId: user.id
                }
              }
            });

        expect(historyCount).toBe(0);
      }
    );

    test(
      "Should rollback application update when history creation fails",
      async function () {
        const { token, user } =
          await createAuthenticatedTestUser();

        const createResponse =
          await createApplication(token);

        expect(
          createResponse.status
        ).toBe(201);

        const applicationId =
          createResponse.body.data
            .application.id;

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

        const updateResponse =
          await request(app)
            .patch(
              "/api/applications/"
              + applicationId
            )
            .set(
              "Authorization",
              "Bearer " + token
            )
            .send({
              company:
                "Airbus Atlantic"
            });

        expect(
          updateResponse.status
        ).toBe(500);

        const storedApplication =
          await prisma.application
            .findFirst({
              where: {
                id: applicationId,
                userId: user.id
              }
            });

        expect(
          storedApplication.company
        ).toBe(
          APPLICATION_PAYLOAD.company
        );

        const historyCount =
          await prisma.applicationHistory
            .count({
              where: {
                applicationId
              }
            });

        expect(historyCount).toBe(1);
      }
    );
  }
);
