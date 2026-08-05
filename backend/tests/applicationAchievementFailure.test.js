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
  unlockFirstApplicationAchievement
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
      unlockApplicationOrganizedAchievement:
        vi.fn(),

      unlockFirstApplicationAchievement:
        vi.fn(),

      unlockFiveApplicationsAchievement:
        vi.fn(),

      unlockFollowUpPlannedAchievement:
        vi.fn()
    };
  }
);

const APPLICATION_PAYLOAD = {
  company: "Airbus",
  position: "Développeur backend",
  status: "sent",
  contractType: "permanent",
  location: "Toulouse",
  locationCode: "31555",
  locationLatitude: 43.6043,
  locationLongitude: 1.4437,
  sentAt: "2026-08-05"
};

beforeEach(async function () {
  vi.clearAllMocks();
  vi.restoreAllMocks();

  vi.spyOn(
    globalThis.console,
    "error"
  ).mockImplementation(function () {});

  await cleanDatabase();
});

afterAll(async function () {
  vi.restoreAllMocks();

  await cleanDatabase();
  await disconnectDatabase();
});

describe(
  "Application achievement failure",
  function () {
    test(
      "Should preserve created application when achievement unlocking fails",
      async function () {
        const { token, user } =
          await createAuthenticatedTestUser();

        unlockFirstApplicationAchievement
          .mockRejectedValueOnce(
            new Error(
              "Achievement unavailable."
            )
          );

        const response = await request(app)
          .post("/api/applications")
          .set(
            "Authorization",
            "Bearer " + token
          )
          .send(APPLICATION_PAYLOAD);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);

        expect(
          response.body.data.application
        ).toMatchObject({
          company:
            APPLICATION_PAYLOAD.company,

          position:
            APPLICATION_PAYLOAD.position,

          location:
            APPLICATION_PAYLOAD.location,

          locationCode:
            APPLICATION_PAYLOAD.locationCode
        });

        const applicationCount =
          await prisma.application.count({
            where: {
              userId: user.id
            }
          });

        expect(applicationCount).toBe(1);

        expect(
          globalThis.console.error
        ).toHaveBeenCalledTimes(1);

        expect(
          globalThis.console.error
        ).toHaveBeenCalledWith(
          "Unable to unlock application achievement.",
          expect.any(Error)
        );
      }
    );
  }
);
