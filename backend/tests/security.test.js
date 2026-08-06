import request from "supertest";
import {
  describe,
  expect,
  test
} from "vitest";

import app from "../src/app.js";
import env from "../src/config/env.js";

describe("HTTP security", function () {
  test("Should add security headers", async function () {
    const response = await request(app)
      .get("/api/health");

    expect(response.status).toBe(200);

    expect(
      response.headers["x-content-type-options"]
    ).toBe("nosniff");

    expect(
      response.headers["x-frame-options"]
    ).toBe("SAMEORIGIN");

    expect(
      response.headers["x-powered-by"]
    ).toBeUndefined();
  });

  test("Should allow the configured frontend origin", async function () {
    const response = await request(app)
      .get("/api/health")
      .set("Origin", env.frontendUrl);

    expect(response.status).toBe(200);

    expect(
      response.headers["access-control-allow-origin"]
    ).toBe(env.frontendUrl);

    expect(
      response.headers["access-control-allow-credentials"]
    ).toBe("true");
  });

  test("Should not expose CORS headers to another origin", async function () {
    const response = await request(app)
      .get("/api/health")
      .set("Origin", "https://attacker.example");

    expect(response.status).toBe(200);

    expect(
      response.headers["access-control-allow-origin"]
    ).toBeUndefined();
  });

  test("Should allow state-changing request from configured frontend origin", async function () {
    const response = await request(app)
      .post("/api/auth/logout")
      .set("Origin", env.frontendUrl);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("Should reject state-changing request from another origin", async function () {
    const response = await request(app)
      .post("/api/auth/logout")
      .set(
        "Origin",
        "https://attacker.example"
      );

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
      success: false,
      message:
        "Cross-origin state-changing request is not allowed.",
      errors: []
    });
  });

  test("Should reject state-changing request from another referer", async function () {
    const response = await request(app)
      .post("/api/auth/logout")
      .set(
        "Referer",
        "https://attacker.example/form"
      );

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
      success: false,
      message:
        "Cross-origin state-changing request is not allowed.",
      errors: []
    });
  });

  test("Should reject oversized JSON payloads", async function () {
    const oversizedPassword = "a".repeat(110 * 1024);

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "user@example.com",
        password: oversizedPassword
      });

    expect(response.status).toBe(413);
    expect(response.body.success).toBe(false);
  });

  test("Should reject malformed JSON payloads", async function () {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email":"user@example.com"');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
