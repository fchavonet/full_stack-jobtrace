import request from "supertest";
import { describe, expect, test } from "vitest";

import app from "../src/app.js";

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
});
