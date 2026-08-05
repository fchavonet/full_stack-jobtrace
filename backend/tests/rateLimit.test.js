import express from "express";
import request from "supertest";
import {
  describe,
  expect,
  test
} from "vitest";

import {
  createRateLimiter
} from "../src/middlewares/rateLimit.middleware.js";

function createLimitedApp(options) {
  const app = express();

  const limiter = createRateLimiter({
    windowMs: 60 * 1000,
    limit: options.limit,
    skipInTest: false,
    skipSuccessfulRequests:
      options.skipSuccessfulRequests
  });

  app.get(
    "/limited",
    limiter,
    function (request, response) {
      const requestedStatus = request.get("X-Test-Status");
      let statusCode = 200;

      if (requestedStatus) {
        statusCode = Number(requestedStatus);
      }

      response.status(statusCode).json({
        success: statusCode < 400
      });
    }
  );

  return app;
}

describe("rate limiting middleware", function () {
  test("Should reject requests exceeding the limit", async function () {
    const app = createLimitedApp({
      limit: 2,
      skipSuccessfulRequests: false
    });

    const firstResponse = await request(app)
      .get("/limited");

    const secondResponse = await request(app)
      .get("/limited");

    const thirdResponse = await request(app)
      .get("/limited");

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);
    expect(thirdResponse.status).toBe(429);

    expect(thirdResponse.body).toEqual({
      success: false,
      message:
        "Too many requests. Please try again later.",
      errors: []
    });

    expect(
      thirdResponse.headers.ratelimit
    ).toBeDefined();

    expect(
      thirdResponse.headers["x-ratelimit-limit"]
    ).toBeUndefined();
  });

  test("Should not count successful requests when configured", async function () {
    const app = createLimitedApp({
      limit: 2,
      skipSuccessfulRequests: true
    });

    await request(app).get("/limited");
    await request(app).get("/limited");
    await request(app).get("/limited");

    const firstFailure = await request(app)
      .get("/limited")
      .set("X-Test-Status", "401");

    const secondFailure = await request(app)
      .get("/limited")
      .set("X-Test-Status", "401");

    const blockedResponse = await request(app)
      .get("/limited")
      .set("X-Test-Status", "401");

    expect(firstFailure.status).toBe(401);
    expect(secondFailure.status).toBe(401);
    expect(blockedResponse.status).toBe(429);
  });
});
