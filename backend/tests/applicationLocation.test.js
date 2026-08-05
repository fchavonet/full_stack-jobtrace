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
  cleanDatabase,
  disconnectDatabase
} from "./helpers/test-db.js";

import {
  createAuthenticatedTestUser
} from "./helpers/test-auth.js";

const APPLICATION_PAYLOAD = {
  company: "Airbus",
  position: "Développeur frontend",
  status: "sent",
  contractType: "permanent",
  location: "Toulouse",
  locationCode: "31555",
  locationLatitude: 43.6043,
  locationLongitude: 1.4437,
  salary: 45000,
  sentAt: "2026-08-05"
};

async function createApplication(
  token,
  payload
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

afterAll(async function () {
  await disconnectDatabase();
});

describe(
  "Application location coordinates",
  function () {
    test(
      "Should save location coordinates",
      async function () {
        const { token } =
          await createAuthenticatedTestUser();

        const response =
          await createApplication(
            token,
            APPLICATION_PAYLOAD
          );

        expect(response.status).toBe(201);

        expect(
          response.body.data.application
        ).toMatchObject({
          location: "Toulouse",
          locationCode: "31555",
          locationLatitude: 43.6043,
          locationLongitude: 1.4437
        });
      }
    );

    test(
      "Should reject incomplete location coordinates",
      async function () {
        const { token } =
          await createAuthenticatedTestUser();

        const payload = {
          ...APPLICATION_PAYLOAD
        };

        delete payload.locationLongitude;

        const response =
          await createApplication(
            token,
            payload
          );

        expect(response.status).toBe(400);

        expect(response.body.errors).toContain(
          "Location code, latitude and longitude must be provided together."
        );
      }
    );

    test(
      "Should reject invalid latitude",
      async function () {
        const { token } =
          await createAuthenticatedTestUser();

        const response =
          await createApplication(
            token,
            {
              ...APPLICATION_PAYLOAD,
              locationLatitude: 95
            }
          );

        expect(response.status).toBe(400);

        expect(response.body.errors).toContain(
          "Location latitude must be between -90 and 90."
        );
      }
    );

    test(
      "Should clear coordinates when location becomes free text",
      async function () {
        const { token } =
          await createAuthenticatedTestUser();

        const createResponse =
          await createApplication(
            token,
            APPLICATION_PAYLOAD
          );

        const applicationId =
          createResponse.body.data
            .application.id;

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
              location: "Télétravail"
            });

        expect(
          updateResponse.status
        ).toBe(200);

        expect(
          updateResponse.body.data
            .application
        ).toMatchObject({
          location: "Télétravail",
          locationCode: null,
          locationLatitude: null,
          locationLongitude: null
        });
      }
    );
  }
);
