import request from "supertest";
import {
  afterEach,
  describe,
  expect,
  test,
  vi
} from "vitest";

import app from "../src/app.js";
import env from "../src/config/env.js";
import errorMiddleware from "../src/middlewares/error.middleware.js";

const originalNodeEnv = env.nodeEnv;

afterEach(function () {
  env.nodeEnv = originalNodeEnv;
  vi.restoreAllMocks();
});

describe("Error handling routes", function () {
  test("GET /api/unknown - Should return route not found error", async function () {
    const response = await request(app).get("/api/unknown");

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Route not found.",
      errors: []
    });
  });

  test("Should hide internal error details in production", function () {
    env.nodeEnv = "production";

    const internalError = new Error(
      "Sensitive database connection details."
    );

    const consoleErrorSpy = vi
      .spyOn(globalThis.console, "error")
      .mockImplementation(function () {});

    let responseStatus = 0;
    let responseBody = null;

    const response = {
      status(statusCode) {
        responseStatus = statusCode;
        return this;
      },

      json(body) {
        responseBody = body;
        return this;
      }
    };

    errorMiddleware(
      internalError,
      {},
      response,
      function () {}
    );

    expect(responseStatus).toBe(500);

    expect(responseBody).toEqual({
      success: false,
      message: "Internal server error.",
      errors: []
    });

    expect(
      consoleErrorSpy
    ).toHaveBeenCalledWith(
      internalError
    );
  });
});
