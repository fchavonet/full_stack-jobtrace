import request from "supertest";
import { describe, expect, test } from "vitest";

import app from "../src/app.js";

describe("Health routes", function () {
  test("GET /api/health: should return API status", async function () {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "API is running.",
      data: {
        status: "ok"
      }
    });
  });

  test("GET /api/health/db: should return database status", async function () {
    const response = await request(app).get("/api/health/db");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "Database connection is working.",
      data: {
        status: "ok"
      }
    });
  });
});
